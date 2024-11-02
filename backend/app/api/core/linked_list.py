class LinkedListNode:
    """
    A class representing a node in a singly linked list.

    Attributes
    ----------
    value : Any
        The value stored in the node.
    next : LinkedListNode or None
        A reference to the next node in the linked list. Defaults to None.

    Methods
    -------
    __init__(value):
        Initializes a LinkedListNode with the given value and sets the next node reference to None.
    """
    def __init__(self, value):
        """
        Initializes a new LinkedListNode.

        Parameters
        ----------
        value : Any
            The value to be stored in the node.
        """
        self.value = value
        self.next = None