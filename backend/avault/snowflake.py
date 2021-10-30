import time
import logging
import os


log = logging.getLogger(__name__)


avaultepoch = 1627257600

worker_id_bits = 5
process_id_shift = 5
max_worker_id = -1 ^ (-1 << worker_id_bits)
max_process_id_shift = -1 ^ (-1 << process_id_shift)
sequence_bits = 12
worker_id_shift = sequence_bits
timestamp_left_shift = sequence_bits + worker_id_bits
sequence_mask = -1 ^ (-1 << sequence_bits)


def snowflake_to_timestamp(_id):
    _id = _id >> 22
    _id += avaultepoch
    _id /= 1000
    return _id


def generator(worker_id: int = 1, process_id: int = os.getpid(), sleep=lambda x: time.sleep(x)) -> int:
    """
    Generate a unique id.
    """
#     assert worker_id >= 0 and worker_id <= max_worker_id
#     assert process_id >= 0 and process_id <= max_worker_id

    last_timestamp = -1

    while True:
        timestamp = int(time.time()*1000)

        if last_timestamp > timestamp:
            log.warning(
                "Clock is moving backwards. Rejecting requests until %d." % last_timestamp)
            sleep(last_timestamp - timestamp)
            continue

        if last_timestamp == timestamp:
            sequence = (sequence + 1) & sequence_mask
            if sequence == 0:
                log.warning("Sequence overrun")
                sequence = -1 & sequence_mask
                sleep(1)
                continue
        else:
            sequence = 0

        last_timestamp = timestamp

        yield (
            ((timestamp - avaultepoch) << (timestamp_left_shift + 5)) |
            (process_id << process_id_shift) |
            (worker_id << worker_id_shift) |
            sequence)
