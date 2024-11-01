from api.core.linked_list import LinkedListNode


class Queue:
    """
    TO implement a queue using the previously implemented singly linked list.
    """

    def __init__(self):
        """
        Initializes an empty queue.

        Attributes
        ----------
        self.head: LinkedListNode or None
            The front node of the queue.
        self.end: LinkedListNode or None
            The last node of the queue.
        """
        self.head = None
        self.end = None

    def is_empty(self):
        """
        To check if the queue is empty.

        Returns
        -------
        bool
            True if the queue is empty, False otherwise.
        """
        if self.head is None and self.end is None:
            return True
        return False

    def enqueue(self, value):
        """
        Adds a node to the end of the queue.

        Parameters
        ----------
        value: Any
            The value to be added to the queue.
        """
        node = LinkedListNode(value)  # node is created

        if self.is_empty():  # case 1: if the linked list is empty
            """
            for an empty linked list, when a single element is added,
            the head and end pointers would point to the node itself
            """
            self.head = node
            self.end = node
        else:                     # case 2: if the linked list is not empty
            """
            if the linked list is not empty, then
            the current end should point to the newly added node and
            the current end should be updated to the new node
            """
            self.end.next = node
            self.end = node

    def dequeue(self):
        """
        Removes and returns the value from the front of the queue.

        Returns
        -------
        Any or None
            The value from the front of the queue if it exists; otherwise, None.

        Note
        -----
        If the queue has only one element, `self.end` is set to None.
        """
        if self.is_empty():  # checks if the queue is empty
            """
            if the queue is empty, then
            there is nothing to return
            """
            return
        if self.head.next is None:  # Corner case: if there's only one element in the queue
            """
            self.end would point to the deleted node in the general case, 
            so, self.end needs to be set to None
            """
            self.end = None
        temp = self.head             # general case, if the queue has more than one value
        """
        In the general case, the end node need not be disturbed,
        only the start node of the queue is removed and returned
        """
        self.head = self.head.next
        return temp.value
