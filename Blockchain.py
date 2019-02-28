import random
from nacl.public import Box
from Votespy.EncryptedVote import evote
import time
import qrcode
from qrcode.image.pure import PymagingImage


class Block(object):
    def __init__(self, private, public, encryptedvote):
        self.public = public
        self.private = private
        self.box = Box(self.private, self.public)
        self.encryptedvote = encryptedvote
        self.prev = None  # pointer 1 block back
        self.hprev = None  # hash of previous pointer
        self.sprev = None  # pointer for jumping back 1 batch at a time rather than 1 block

    def decrypt(self):
        vote = self.box.decrypt(self.encryptedvote.encrypted)  # decryption
        return vote

    def security(self):
        temporary = self.prev
        if hash(temporary) != self.hprev:
            print("System has been tampered with")
            return False
        else:
            return True


class Blockchain:  # needs to be modified so as to exploit a jumping trick
    def __init__(self):
        self.tailval = None
        self.voterSet = set()

    def search(self, public, public2):  # used to show voter based on their public key
        val = self.tailval
        if type(val.sprev) != type(None):
            while val.sprev.public is not public2:  # jump feature
                if type(val.sprev) != type(None):
                    break
                val = val.sprev
        while val.public is not public:
            if val.prev is None:
                print("Not in votes")
                return 0
            val = val.prev
        t = Block.decrypt(val)
        return t.decode()

    def listprint(self):  # should be function to print out every vote.
        printval = self.tailval
        printlist=[]
        while printval is not None:
            t = Block.decrypt(printval)
            printlist.append(t.decode())
            printval = printval.prev
        return printlist


vote_block_chain = Blockchain()


def runfunc(votings, privatek2, publick2, vote_block_chain=vote_block_chain):  # runs for a bunch
    batchsize = 10
    private2 = privatek2
    public2 = publick2
    n = 1  # machine number
    k = 3  # number of machines
    if len(votings) < 10:
        batchsize = len(votings)
    batch = [None] * batchsize
    for x in batch:
        index = random.randint(0, batchsize - 1)
        while batch[index] is not None:
            index = random.randint(0, batchsize - 1)
        evote1 = evote(votings[0].vote, votings[0].private, public2, private2, votings[0].public)
        batch[index] = evote1
        vote_block_chain.voterSet.add(votings[0].public)
        votings.pop(0)
    while not n % k == int(time.time()) % k:
        pass  # do nothing, recurrence problem handling
    super_prev = vote_block_chain.tailval
    for y in batch:
        temp = Block(private2, y.public, y)
        temp.prev = vote_block_chain.tailval
        temp.hprev = hash(vote_block_chain.tailval)
        temp.sprev = super_prev
        vote_block_chain.tailval = temp


# Add in print function here, need to add in QR reader
def printing(batchsize, super_prev, specvoter, vote_block_chain=vote_block_chain):
    qrgenerator = [None] * batchsize
    batch = []
    batch.append(specvoter)
    # append batchsize-1 more voters from blockchain if available
    k = 0
    temp = vote_block_chain.tailval
    if type(temp) == type(None):
        while k < batchsize - 2:
            batch.append(specvoter)  # special handling for first voter
            k = k + 1
    else:
        while k < batchsize - 2:
            if type(temp) == type(None):
                batch.append(vote_block_chain.tailval)  # special handling for 2nd-9th voters
            else:
                batch.append(temp)
                temp = temp.prev
            k = k + 1
    for z in batch:
        index = random.randint(0, batchsize - 1)
        while qrgenerator[index] is not None:
            index = random.randint(0, batchsize - 1)
        qrgenerator[index] = z
    i = 0
    data = []
    for w in qrgenerator:
        if type(w) == type(None):
            continue
        if w.public == specvoter.public:
            data.insert(0, i)
        if type(super_prev) != type(None):
            tuplex = (str(w.public), str(super_prev.public))
        else:
            tuplex = (str(w.public), None)
        i = i + 1
        data.append(tuplex)  # contains batch data, first item is index of user
    i = 0
    images = [data[0]]
    for u in data:
        if i == 0:
            i = i + 1
            continue
        img = qrcode.make(u, image_factory=PymagingImage)  # produces png, need to send this over along with data[0]
        images.append(img)
    return images
