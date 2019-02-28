import face_recognition
from flask import Flask, json, request, abort, g, session
import hashlib
import base64
import numpy as np
#import bloomfilter
import zlib #compression
from nacl.public import Box, PrivateKey
from nacl.utils import random
import sys
from werkzeug.utils import secure_filename

sys.path.append('../')
from Blockchain import *


class faceEncoder:
    def __init__(self, randomSeed=42):
        self._randomSeed = randomSeed

    def encode(self, image):
        face_encodings = face_recognition.face_encodings(image)[0]
        face_b85 = base64.b85encode(face_encodings)
        return face_b85


class keyGenerator:
    def __init__(self):
        self.encoding = None

    def generateKey(self, image):
        encoder = faceEncoder()
        self.encoding = encoder.encode(image)
        return self.encoding

    def checkSimilar(self, otherSecret):
        if PrivateKey.from_seed(zlib.compress(self.encoding)[:32]).public_key == otherSecret:
            return True
        return False


def bxor(s1, s2):
    l = ''.join([str(a ^ b) for a,b in zip(s1,s2)]).encode('utf-8')
    return l


bc = Blockchain()


class runBatch():
    def __init__(self, blockchain=bc):
        print('batch actually created')
        self.batchSecret = PrivateKey.generate()
        self.batchPublic = self.batchSecret.public_key
        self.counter = 0
        self.batchSize = 10
        self.votes = []
        self.bc = blockchain

    def enterVote(self, candidate, privateKey, publicKey):
        voteObject = votes(candidate, privateKey, publicKey)
        self.votes.append(voteObject)
        self.counter += 1

    def checkFull(self):
        if self.counter >= self.batchSize:
            return True
        return False

    def insertIntoChain(self):
        if self.checkFull():
            runfunc(self.votes, self.batchSecret, self.batchPublic, self.bc)
        else:
            pass

def key_check(pk, blockchain=bc):
    public_key = pk.public_key
    if public_key in bc.voterSet:
        print("invalid")
        return False
    else:
        return True
def main_test():
    generator = keyGenerator()
    img = face_recognition.load_image_file('/Users/hackpert/Downloads/img1.jpg')
    key = generator.generateKey(img)
    pk = PrivateKey.from_seed(zlib.compress(key)[:32])
    batch = runBatch(bc)
    batch.enterVote("AB", pk, pk.public_key)
    print("----NEW STUFF----")

    batch.insertIntoChain()

ALLOWED_EXTENSIONS = []

def get_extension(filename):
    filename.rsplit('.', 1)[1].lower()

def allowed_file(filename):
    return '.' in filename and \
        get_extension(filename) in ALLOWED_EXTENSIONS


app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

batch = None


@app.route('/reset', methods=['GET'])
def reset():
    global batch
    if request:
        print(type(g))
    if batch is None:
        batch = runBatch(bc)
    else:
        if batch.checkFull():
            batch = runBatch(bc)
    g.secret, g.public = None, None
    return 'Success'


@app.route('/query', methods=['GET'])
def query():
    g.tmp = 'balrog'
    print(g.tmp)
    print(batch)
    return batch


@app.route('/uploadImage', methods=['POST'])
def uploadImage():
    data = request.get_json()
    print(data['img'])
    filedata = base64.decodebytes(data['img'].encode())
    g.tmpname = 'tmp.jpg'
    with open(g.tmpname, 'wb') as fh:
        fh.write(filedata)
    image = face_recognition.load_image_file(g.tmpname)
    keygen = keyGenerator()
    key = keygen.generateKey(image)
    g.secret = PrivateKey.from_seed(zlib.compress(key)[:32])
    g.public = secret.public_key
    print(g.secret, g.public)
    #could check for collision here


@app.route('/vote/<candidate_id>', methods=['POST'])
def vote(candidate_id):
    if not g.secret:
        abort(403)
    json_content = request.get_json()
    print(json_content)

    batch.enterVote(json_content['cand1'], g.secret, g.public)

@app.route('/verify', methods=['POST'])
def verify():
    json_content = request.get_json()
    publicKey = json_content['publicKey']
    #verification code
    return True


if __name__=='__main__':
    #main_test()
    app.run('127.0.0.1', 8000)
