build:
	docker build -t country_service .
seed-data:
	docker exec -it countryservice_web_1 node_modules/.bin/typeorm migration:run