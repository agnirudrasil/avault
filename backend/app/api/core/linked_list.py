class LinkedListNode:
    """
    Implementing a singly linked list for the search queue.
    """

    def __init__(self, value):
        """
        Initializes a LinkedListNode with a specified value.

        Parameters
        ----------
        value: Any
            The data to be stored in the node.
        self.next: LinkedListNode or None
            The reference to the next node in the linked list.
            If there are no nodes next, self.next is set to None.
        """
        self.value = value
        self.next = None
