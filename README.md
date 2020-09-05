# Cloudflare Dynamic DNS

Dynamically update Cloudflare DNS record to provide a persistent addressing method for devices that change their IP address.

## Getting Started

1. Clone git repository and install npm dependencies:

```
git clone git@github.com:eymengunay/cloudflare-ddns.git
cd cloudflare-ddns
npm install
```

2. Set environment variables as per the table below. (you can also use a `.env` file)

3. Start application:

```
npm start
```

## Environment Variables

| Name              | Description   | Required |
|-------------------|---------------|----------|
| CLOUDFLARE_ZONE   | DNS Zone ID   | Yes      |
| CLOUDFLARE_RECORD | DNS Record ID | Yes      |
| CLOUDFLARE_TOKEN  | API Token     | Yes      |