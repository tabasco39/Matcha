# makefile pour lancer le projet Matcha avec docker-compose

run:
	docker compose up -d --build
	@echo "Matcha is running..."
	@echo "Access the app at http://localhost:8080"
	@echo "To stop the app, run 'make stop'"

stop:
	docker compose down 
	@echo "Matcha has been stopped."

remove: 
	docker compose down -v
	docker volume rm matcha_uploads
	docker volume rm matcha_db_data
	@echo "Matcha has been removed."

rmImages:
	docker image rm matcha-client:latest mysql:8.0 phpmyadmin:latest

re: stop
	$(MAKE) run