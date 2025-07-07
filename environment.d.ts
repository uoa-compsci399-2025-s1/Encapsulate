declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * The mongoDB connection string
       */
      DATABASE_URI: string
      /**
       * Secret used to secure Payload
       */
      PAYLOAD_SECRET: string
      /**
       * The Google Auth Client ID, view the [docs](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/Backend-Architecture#google-oauth-authentication) on how to generate one.
       */
      GOOGLE_CLIENT_ID: string
      /**
       * The Google Auth Client Secret, view the [docs](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/Backend-Architecture#google-oauth-authentication) on how to generate one.
       */
      GOOGLE_CLIENT_SECRET: string
      /**
       * The public URL of the website
       */
      NEXT_PUBLIC_URL: string
      /**
       * Secret used to secure JWT. You can see how to generate this secret [here](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/Backend-Architecture#jwt-authentication).
       */
      JWT_SECRET: string
      /**
       * The access key ID for the IAM user with access to the S3 bucket.
       * For all S3 related set-up, please refer to the [docs](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/AWS-Deployment#creating-an-s3-bucket-for-cms)
       */
      S3_ACCESS_KEY_ID: string
      /**
       * The secret access key for the IAM user with access to the S3 bucket
       * [docs](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/AWS-Deployment#creating-an-s3-bucket-for-cms)
       */
      S3_SECRET_ACCESS_KEY: string
      /**
       * The region of the S3 bucket
       * [docs](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/AWS-Deployment#creating-an-s3-bucket-for-cms)
       */
      S3_REGION: string
      /**
       * The name of the S3 bucket
       * [docs](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/AWS-Deployment#creating-an-s3-bucket-for-cms)
       */
      S3_BUCKET: string
      /**
       * The public Cloudflare Turnstile site key for the website
       */
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: string
      /**
       * The secret Cloudflare Turnstile site key for the website
       */
      TURNSTILE_SECRET_KEY: string
    }
  }
}

export {}
