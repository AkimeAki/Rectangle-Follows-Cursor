.PHONY: コンテナ一覧
ps:
	docker compose ps -a

.PHONY: コンテナ起動
up:
	docker compose build --no-cache
	docker compose up -d

.PHONY: コンテナ停止
down:
	docker compose down --rmi all --volumes --remove-orphans

.PHONY: パッケージインストール
package-install:
	docker compose exec -it extension npm ci

.PHONY: コンテナにアタッチ
attach:
	docker compose exec -it extension bash
