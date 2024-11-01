from api.core.linked_list import LinkedListNode


class Queue:
    def __init__(self):
        self.head = None
        self.end = None

    def is_empty(self):
        if self.head is None and self.end is None:
            return True
        return False

    def enqueue(self, value):
        node = LinkedListNode(value)
        if self.is_empty():
            self.head = node
            self.end = node
        else:
            self.end.next = node
            self.end = node

    def dequeue(self):
        if self.is_empty():
            return
        if self.head.next is None:  # corner case: if there is only one element in the queue
            self.end = None
        temp = self.head
        self.head = self.head.next
        return temp.value
