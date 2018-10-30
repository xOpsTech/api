from util import pretty_ts
from enhancements import BaseEnhancement

class TimeEnhancement(BaseEnhancement):
    def process(self, match):
        match['@timestamp'] = pretty_ts(match['@timestamp'])
        match['starttime'] = self.rule['starttime']