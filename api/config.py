class Config:
	DEBUG = False
	DEVELOPMENT = False
	CSRF_ENABLED = True

class ProductionConfig(Config):
	pass

class DevelopmentConfig(Config):
    DEBUG = True
    DEVELOPMENT = True