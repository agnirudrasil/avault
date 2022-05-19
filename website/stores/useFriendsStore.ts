import produce from "immer";
import create from "zustand";
import { combine } from "zustand/middleware";
import { User } from "./useUserStore";

export interface Friend {
    id: string;
    type: number;
    user: User;
}

export const useFriendsStore = create(
    combine({ friends: {} as Record<string, Friend> }, set => ({
        updateFriend: (friend: Friend) =>
            set(state =>
                produce(state, draft => {
                    draft.friends[friend.id] = friend;
                })
            ),
        addFriend: (friend: Friend) =>
            set(state =>
                produce(state, draft => {
                    draft.friends[friend.id] = friend;
                })
            ),
        removeFriend: (id: string) =>
            set(state =>
                produce(state, draft => {
                    delete draft.friends[id];
                })
            ),
        setState: (friends: Friend[]) =>
            set(
                produce(draft => {
                    friends.forEach(
                        friend => (draft.friends[friend.id] = friend)
                    );
                })
            ),
    }))
);
