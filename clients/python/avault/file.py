import io
import os
from typing import Union, Any, Optional, Dict


class File:
    def __init__(self,
                 fp: Union[str, bytes, os.PathLike[Any], io.BufferedIOBase],
                 filename: Optional[str] = None, description: Optional[str] = None):
        if isinstance(fp, io.IOBase):
            if not (fp.seekable() and fp.readable()):
                raise ValueError("File must be seekable and readable")
            self.fp: io.BufferedIOBase = fp
            self._original_pos = fp.tell()
        else:
            print("Correct")
            self.fp = open(fp, "rb")
            self._original_pos = 0

        if filename is None:
            if isinstance(fp, str):
                _, filename = os.path.split(fp)
            else:
                filename = getattr(fp, "name", "unnamed")
        self.filename = filename
        self.description: Optional[str] = description

    def to_dict(self, index) -> Dict[str, Any]:
        payload = {
            'id': index,
            "filename": self.filename,
        }

        if self.description:
            payload["description"] = self.description

        return payload
