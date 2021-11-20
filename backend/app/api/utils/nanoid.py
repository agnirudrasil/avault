from __future__ import unicode_literals
from __future__ import division

from os import urandom
from math import ceil, log

DEFAULT_SET = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'


def algorithm_generate(random_bytes):
    return bytearray(urandom(random_bytes))


def method(alphabet: str, size: int) -> str:
    alphabet_size = len(alphabet)

    mask = 1
    if alphabet_size > 1:
        mask = (2 << int(log(alphabet_size - 1) / log(2))) - 1
    step = int(ceil(1.6 * mask * size / alphabet_size))

    id = ''
    while True:
        random_bytes = algorithm_generate(step)

        for i in range(step):
            random_byte = random_bytes[i] & mask
            if random_byte < alphabet_size:
                if alphabet[random_byte]:
                    id += alphabet[random_byte]

                    if len(id) == size:
                        return id


def generate(alphabet=DEFAULT_SET, size=21) -> str:
    return method(alphabet, size)
