<div align="center">
  <img src="public/light-logo.png" alt="Encapsulate Logo" width="120" />

  # Encapsulate

  [![CI Pipeline](https://img.shields.io/github/actions/workflow/status/uoa-compsci399-2025-s1/Encapsulate/ci-pipeline.yml?branch=main&label=CI%20Pipeline&logo=githubactions&logoColor=white&style=for-the-badge)](https://github.com/uoa-compsci399-2025-s1/Encapsulate/actions/workflows/ci-pipeline.yml "Continuous Integration Pipeline: lint, prettier, code generation, tests, build")
  [![CD Pipeline](https://img.shields.io/github/actions/workflow/status/uoa-compsci399-2025-s1/Encapsulate/cd-pipeline.yml?branch=main&label=CD%20Pipeline&logo=amazonec2&logoColor=white&style=for-the-badge)](https://github.com/uoa-compsci399-2025-s1/Encapsulate/actions/workflows/cd-pipeline.yml "Continuous Deployment Pipeline: deploy to production, deploy to staging")
  [![License](https://img.shields.io/github/license/uoa-compsci399-2025-s1/Encapsulate?style=for-the-badge)](https://github.com/uoa-compsci399-2025-s1/Encapsulate/tree/main/LICENSE "MIT License")

  [![Production Monitoring](https://img.shields.io/uptimerobot/status/m800642218-33a651eaa7d41a0f2e0103b8?style=for-the-badge&label=Production&logo=rocket&logoColor=fff&up_message=online&down_message=offline&up_color=blue)](https://stats.uptimerobot.com/kBXBfHuI9R/800642218 "Production Monitoring")
  [![Staging Monitoring](https://img.shields.io/uptimerobot/status/m800642225-1604e8691d20ede3cc5d7b75?style=for-the-badge&label=Staging&logo=rocket&logoColor=fff&up_message=online&down_message=offline&up_color=blue)](https://stats.uptimerobot.com/kBXBfHuI9R/800642225 "Staging Monitoring")

  <em>Project by Team 8, Status 418.</em>
</div>

### About

Deployment: https://compsci399.com

Project management tool: [GitHub Projects](https://github.com/orgs/uoa-compsci399-2025-s1/projects/28?query=sort%3Aupdated-desc+is%3Aopen)

Encapsulate is a platform that aims to provide a comprehensive solution for Clients, Admins, and Students to manage, submit, and view projects for the [University of Auckland's BSc Computer Science](https://www.auckland.ac.nz/en/study/study-options/find-a-study-option/computer-science/undergraduate/bsc-compsci-from-2019.html) capstone course, COMPSCI 399. Encapsulate is built for a user-friendly interface, aiming for an efficient and effective user experience.

## Setting up the Project

### Requirements:

#### **Node.js installation**

You will need to have `Node.js` installed, so you can use `pnpm`.

**Volta:**

It is recommended to use [Volta](https://volta.sh/) to manage the Node.js version.

You can install Volta by following the [instructions](https://docs.volta.sh/guide/getting-started).

**Node Version Manager (NVM):**

Alternatively, you can use [NVM](https://github.com/nvm-sh/nvm) to manage the Node.js version.

* [Windows Installation](https://github.com/coreybutler/nvm-windows/releases)

* [UNIX Installation](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

In the root directory, run the following command to install the correct version of Node.js:

```bash
nvm install
nvm use
```

#### Package manager installation

It is recommended to use [pnpm](https://pnpm.io/) as the package manager.

If the correct version of Node.js is installed, you can run:

```bash
corepack enable
pnpm install
```

To start the development server, run:

```bash
pnpm turbo:dev
```

The development server will be running at `http://localhost:3000`.

#### Environment Variables

Environment variables are used to store sensitive information that should not be stored in the codebase. These are stored in a `.env` file in the root of the project.

Copy the `.env.example` file and rename it to `.env`.

```bash
cp .env.example .env
```

#### Type Generation

We use payload's built-in code generation to generate types for our project. To do this you can run the following command:

```bash
pnpm turbo:generate:types
```

We also need to generate import maps for our project. To do this you can run the following command:

```bash
pnpm turbo:generate:importmap
```

### Testing

Automated testing is an important part of writing code that can be maintained and understood long after the developers stop working on code.

We use [vitest](https://vitest.dev/) as our test runner because of its ease of setup

Tests should be suffixed with the extension, `.test.ts`. I.e. for `auth.ts`, we have `auth.test.ts`.

To run all the tests the following command can be used

```bash
pnpm turbo:test
```

To run a single test you can use the following command

```bash
pnpm test <test-name>
```

## Technical Stack

We use the following technologies:

**Development Operations**

We are using the following tools for development operations:

- [pnpm](https://pnpm.io/)
  - Used to manage dependencies and scripts for the project.
- [turbo](https://turbo.build/)
  - Used to speed up the development process by running tasks in parallel, caching results, and optimizing dependencies.
- [Docker](https://www.docker.com/)
  - Used to containerize the application and its dependencies, ensuring consistent and reproducible environments.
- [GitHub Actions](https://github.com/features/actions)
  - Used to automate the build, test, and deployment process, ensuring that the application is always in a working state.
- [Cloudflare](https://www.cloudflare.com/)
  - Used to improve the performance and security of the application.

**Frontend:**

The main framework for this project is using `Next.js`, it is most important to understand that we are using the [App Router](https://nextjs.org/docs/app) and [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) to build the project. Note that you will need to have some understanding of React to work on this project.

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

**Backend:**

We are using PayloadCMS to manage the content of the website, as well as define the shape of our data. This takes away a lot of the hard work that is put into setting up a database and API. You will have to familiarise yourself with how to use [Payload's API](https://payloadcms.com/docs/local-api/overview).

- [Payload CMS](https://payloadcms.com/)
- [Vitest](https://vitest.dev/)

## Contributing

See further towards contributing guidelines in the [GitHub Wiki](https://github.com/uoa-compsci399-2025-s1/Encapsulate/wiki/)

## Acknowledgements

[Eric Zheng - Facilitator](https://github.com/monoclonalAb)

[Jeffery Ji - Tech Lead](https://github.com/jeffplays2005)

[JooHui Lee - UI/UX Lead](https://github.com/joohuil)

[Bethany Yates - Frontend Lead](https://github.com/bethany-aroha)

[Dennis Hu - Backend Lead](https://github.com/midnightcuberx)

[Sheena Lin - DevOps Lead](https://github.com/elin277)

## License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.

## Future Plans

For future enhancement of Encapsulate, there are several extensions we would like to recommend. First, support for project attachments and in-modal project editing. The project could also be further enhanced by implementing a messaging system between clients and admins to streamline communication regarding project proposals. Currently, admins must manually copy and paste client emails to contact them. Alternatively, an automated email notification system could be introduced to inform clients of any issues with their proposals.

Another potential extension is the full automation of the capstone selection and allocation process. This would allow students to form groups and submit their project preferences to Encapsulate, to then be automatically matched to the most suitable project. To ensure authenticity and prevent impersonation, this would likely require the checking of student SSO login credentials against the list of students enrolled in COMPSCI399. This enhancement would reduce errors and further ease the workload on course coordinators.
