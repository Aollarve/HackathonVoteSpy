from nacl.public import Box


class votes:
    def __init__(self, vote, private, public):
        self.private = private
        self.public = public
        self.vote = vote


class evote(object):
    def __init__(self, vote, private1, public2, private2, public1):
        self.private1 = private1
        self.public2 = public2
        self.private2 = private2
        self.public = public1
        self.vote=vote # testing
        box = Box(self.private1, self.public2)
        message = str.encode(vote)
        self.encrypted = box.encrypt(message)
