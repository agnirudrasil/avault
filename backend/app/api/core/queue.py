from api.core.linked_list import LinkedListNode


class Queue:
    """
    A Queue implementation using a linked list structure.

    Attributes:
        head (LinkedListNode): The first node in the queue.
        end (LinkedListNode): The last node in the queue.
    """

    def __init__(self):
        """
        Initializes an empty queue.
        """
        self.head = None
        self.end = None

    def is_empty(self):
        """
        Checks if the queue is empty.

        Returns:
            bool: True if the queue is empty, False otherwise.
        """
        if self.head is None and self.end is None:
            return True
        return False

    def enqueue(self, value):
        """
        Adds a value to the end of the queue.

        Parameters:
            value (any): The value to be added to the queue.
        """
        node = LinkedListNode(value)  # node is created

        if self.is_empty():  # case 1: if the linked list is empty
            self.head = node
            self.end = node
        else:  # case 2: if the linked list is not empty
            self.end.next = node
            self.end = node

    def dequeue(self):
        """
        Removes and returns the value at the front of the queue.

        Returns:
            any: The value at the front of the queue.
            None: If the queue is empty.
        """
        if self.is_empty():  # checks if the queue is empty
            return None
        if self.head.next is None:  # Corner case: if there's only one element in the queue
            self.end = None
        temp = self.head  # general case, if the queue has more than one value
        self.head = self.head.next
        return temp.value
