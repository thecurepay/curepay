"""Enable ``python -m curepay``."""

import sys

from curepay.cli import main

if __name__ == "__main__":
    sys.exit(main())
