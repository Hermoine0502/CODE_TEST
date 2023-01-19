from hydra import initialize, compose
    
class Settings():
    def __init__(self):
        with initialize(config_path="./"):
            self.__cfg = compose(config_name='config')

    @property
    def db(self):
        return self.__cfg.db

    @property
    def executor(self):
        return self.__cfg.executor