import asyncio
import urllib.parse
from typing import Generator

import aiohttp
import mistune
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from api import models
from api.core import settings
from api.core.celery_app import app, sync_websocket_emitter
from api.core.events import Events
from api.db.session import SessionLocal
from api.schemas.message import Embeds


class Webscraper:
    def __init__(self, urls):
        self.urls = list(urls)
        self.all_data = []
        self.master_dict = {}
        asyncio.run(self.main())

    async def fetch(self, session, url):
        try:
            async with session.get(url) as response:
                if response.headers["Content-Type"] in ["image/png", "image/jpeg", "image/gif", "image/jpg",
                                                        "image/gif"]:
                    return url, {"image": url}
                elif response.headers["Content-Type"].startswith("text/html"):
                    response_text = await response.text()
                    og_tags = await self.extract_og_tags(response_text)
                    return url, og_tags
                return url, {}
        except Exception as e:
            pass

    @staticmethod
    async def extract_og_tags(text):
        soup = BeautifulSoup(text, "lxml")
        title = soup.find("title")
        og_title = soup.find("meta", property="og:title")
        site_type = soup.find("meta", property="og:type")
        description = soup.find("meta", attrs={"name": "description"})
        og_description = soup.find("meta", property="og:description")
        url = soup.find("meta", property="og:url")
        image = soup.find("meta", property="og:image")
        site_name = soup.find("meta", property="og:site_name")
        twitter_description = soup.find(
            "meta", attrs={"name": "twitter:description"})
        twitter_title = soup.find("meta", attrs={"name": "twitter:title"})
        twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
        twitter_player = soup.find("meta", attrs={"name": "twitter:player"})
        twitter_card = soup.find("meta", attrs={"name": "twitter:card"})
        twitter_player_width = soup.find(
            "meta", attrs={"name": "twitter:player:width"})
        twitter_player_height = soup.find(
            "meta", attrs={"name": "twitter:player:height"})

        return {
            "title": twitter_title["content"] if twitter_title else og_title[
                "content"] if og_title is not None else title.string if title is not None else None,
            "type": site_type["content"] if site_type else None,
            "description": twitter_description["content"] if twitter_description else og_description[
                "content"] if og_description else description["content"] if description else None,
            "url": url["content"] if url else None,
            "image": twitter_image["content"] if twitter_image else image["content"] if image else None,
            "player": {
                "url": twitter_player["content"] if twitter_player else None,
                "width": twitter_player_width["content"] if twitter_player_width else None,
                "height": twitter_player_height["content"] if twitter_player_height else None
            } if twitter_player else None,
            "site_name": site_name["content"] if site_name else None,
            "card": twitter_card["content"] if twitter_card else None,
        }

    async def main(self):
        tasks = []
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; AvaultBot/1.0; +https://avault.agnirudra.me)",
            "Accept-Language": "en-US"
        }
        async with aiohttp.ClientSession(headers=headers) as session:
            for url in self.urls[:4]:
                tasks.append(self.fetch(session, str(url)))

            htmls = await asyncio.gather(*tasks)
            self.all_data.extend(htmls)

            for html in htmls:
                if html is not None:
                    url = html[0]
                    self.master_dict[url] = html[1]
                else:
                    continue


def get_db() -> Generator[Session, None, None]:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


@app.task()
def embed_message(message_text, message_id, guild_id, current_user):
    message_urls = []
    db: Session = next(get_db())

    def traverse_tree(tree, urls):
        for node in tree:
            if isinstance(node.get("children", None), list):
                traverse_tree(node.get("children"), urls)
            if node["type"] == "link":
                urls.append(node["link"])

    markdown = mistune.create_markdown(
        renderer=mistune.AstRenderer(), plugins=["url"])
    m_tree = markdown(message_text)
    traverse_tree(m_tree, message_urls)
    scraper = Webscraper(urls=set(message_urls))
    embeds = []
    for key, value in scraper.master_dict.items():
        embeds.append(Embeds(**{
            "title": value.get("title", ""),
            "image": {
                "url": f'{settings.SERVER_HOST}/api/v1/proxy?path={urllib.parse.quote_plus(value.get("image", "") if value.get("image", "").startswith("http") else urllib.parse.urljoin(key, value.get("image")))} '
            } if value.get(
                "image", None) else None,
            "description": value.get("description", ""),
            "url": key,
            "type": "video" if value.get("player", None) else "link",
            "video": {
                "url": value.get("player", {}).get("url", ""),
                "width": value.get("player", {}).get("width", None),
                "height": value.get("player", {}).get("height", None)
            } if value.get("player", None) else None,
            "provider": {
                "name": value.get("site_name", None),
            },
        }).json())
    message = db.query(models.Message).filter_by(id=message_id).first()
    if message:
        message.embeds = embeds
        db.commit()
        sync_websocket_emitter(db, message.channel_id, guild_id, Events.MESSAGE_UPDATE,
                               message.serialize(current_user, db))
    return scraper.master_dict
