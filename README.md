# Checkpoint Backend

Checkpoint Backend is a backend RESTful APIs server that provides API endpoints for [Checkpoint](https://checkpoint.tokyo), a client-side website from the repository [Checkpoint Frontend](https://github.com/KritapasSuwannawin/Checkpoint-Frontend).

## Tech Stack

Key libraries and cloud services that this project uses include:

- **ExpressJS**, a framework for building RESTful APIs server in NodeJS.
- **Node Postgres**, a JavaScript library that provides an interface for Node.js applications to interact with PostgreSQL databases.
- **AWS SES**, an email sending service for sending emails to customers.

This project and its associated database server are hosted on **Amazon Web Services (AWS)**, utilizing **AWS Elastic Beanstalk** and **AWS RDS**, respectively.

## Status

Checkpoint Backend is currently up and running, serving many real users daily. However, as new requirements from the Checkpoint team become available, the project will be updated to accommodate the latest changes.

## Roadmap

My plan to improve the current version of this project mainly focuses on implementing the following security measures:

- Improve authentication method by integrating Json Web Token (JWT).
- Perform server-side validation on information sent with requests, particularly user inputs.
- Implement data sanitization to prevent PostgreSQL query injection and cross-site scripting (XSS) attacks.
- Set up security HTTP headers.
- Replace callback functions with async/await.
