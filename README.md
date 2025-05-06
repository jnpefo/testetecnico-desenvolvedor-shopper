# testetecnico-desenvolvedor-shopper
Teste Técnico - Desenvolvedor Web Full Stack - Shopper

# 📸 Projeto de Leitura de Imagens - Shopper.com.br

## 📝 Descrição

Este projeto consiste em uma API desenvolvida para o **processamento de imagens**, com foco na **extração de medidas** a partir de imagens enviadas. A API é construída com **Node.js** e **TypeScript**, utilizando a **API do Google Gemini** para realizar a análise das imagens.

A aplicação é **dockerizada** para facilitar sua configuração e implantação.

---

## 🚀 Funcionalidades

A API oferece os seguintes endpoints:

- `POST /upload` – Enviar uma imagem e extrair a medida.
- `GET /<customer_code>/list` – Listar medidas de um cliente específico.
- `POST /confirm-measure` – Confirmar uma medida.

---

## 🛠️ Tecnologias Utilizadas

- Node.js
- TypeScript
- Express.js
- Docker
- Google Gemini API
- Vitest (para testes)

---

## ⚙️ Configuração

### 1. Clonar o repositório

```bash
git clone <seu_repositorio>
cd <seu_repositorio>
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
GEMINI_API_KEY=<sua_chave_api_gemini>
```

### 3. Docker

Certifique-se de ter o **Docker** e o **Docker Compose** instalados.

Inicie os containers:

```bash
docker compose up -d
```

### 4. Instalar dependências (caso queira rodar localmente)

```bash
npm install
```

---

## ✅ Executando os testes

```bash
npm run test:coverage
```

---

## 📡 Endpoints

### POST `/upload`

> Envia uma imagem para extração da medida.

**Body:**

```json
{
  "image": "base64_encoded_image_data",
  "customer_code": "codigo_do_cliente",
  "measure_datetime": "2024-01-01T12:00:00Z",
  "measure_type": "WATER"
}
```

**Resposta:**

```json
{
  "image_url": "url_da_imagem_salva",
  "measure_value": 123.45
}
```

---

### GET `/<customer_code>/list`

> Lista as medidas realizadas por um cliente.

**Parâmetros de URL:**

- `customer_code`: obrigatório
- `measure_type`: opcional (`WATER` ou `GAS`)

**Resposta:**

```json
[
  {
    "measure_uuid": "uuid_da_medida",
    "measure_datetime": "2024-01-01T12:00:00Z",
    "measure_type": "WATER",
    "has_confirmed": false,
    "image_url": "url_da_imagem"
  }
]
```

---

### POST `/confirm-measure`

> Confirma uma medida.

**Body:**

```json
{
  "customer_code": "codigo_do_cliente",
  "measure_uuid": "uuid_da_medida"
}
```

**Resposta:**

```json
{
  "message": "Medida confirmada com sucesso!"
}
```

---

## 📌 Observações

- A aplicação deve rodar via Docker.
- A chave da API Gemini é obrigatória e deve ser informada no `.env`.
- Testes unitários e de integração estão implementados usando Vitest.

---

## 📷 Exemplo de uso

Você pode testar os endpoints via [Postman](https://www.postman.com/) ou ferramentas similares, usando o endpoint:

```
http://localhost:80
```
