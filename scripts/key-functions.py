#!/usr/bin/python
# This script provides tools to manipulate and extract info from RSA keys

import sys, argparse, os
from os.path import basename
from Crypto.PublicKey import RSA
import hashlib


def get_fingerprint(keyFile):
    rsaKey = None
    with open(keyFile, 'r') as f:
        rsaKey = RSA.importKey(f.read())

    if not rsaKey:
        raise Exception("Could not read in rsa key %s" % (keyFile))

    if rsaKey.has_private():
        pub_key = rsaKey.publickey()
        fingerprint = hashlib.md5(pub_key.exportKey('DER')).hexdigest()
        return fingerprint
    else:
        fingerprint = hashlib.md5(rsaKey.exportKey('DER')).hexdigest()
        return fingerprint

def __make_parser():
    p = argparse.ArgumentParser(description='This does things to RSA keys')
    p.add_argument('-k', '--key', type=str, help='the key you want to do stuff to', default = None, required = True)
    p.add_argument('-f', '--fingerprint', help='get a fingerprint from a key', action = 'store_true')
    return p

def __main(argv):
    parser = __make_parser()
    settings = parser.parse_args(argv[1:])
    MYDIR = os.path.dirname(os.path.realpath(__file__))

    if settings.fingerprint:
        print get_fingerprint(settings.key)

    sys.exit(0)

if __name__ == "__main__":
    __main(sys.argv)

__doc__ += __make_parser().format_help()
