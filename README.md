# RuneBingo

An application that lets Old School RuneScape players create and manage bingo events.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)

### Configuration

> [!IMPORTANT]
> For better OS support, this repository uses LF line endings (Unix-style). If you are running on Windows, please run the following command to ensure that git checks out files with the correct line endings:
>
> ```bash
> git config --global core.autocrlf true
> ```

Copy the `.env.example` file to `.env` and fill in the necessary values. Their names make them pretty self-explanatory, but here's a table for reference:

| Name                | Description                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_URL`      | Hostname of the PostgreSQL server.                                                                                  |
| `POSTGRES_PORT`     | Port of the PostgreSQL server.                                                                                      |
| `POSTGRES_USER`     | Username that has access to the PostgreSQL server. Also needs access to the primary database and test database.     |
| `POSTGRES_PASSWORD` | Password of the postgres user.                                                                                      |
| `POSTGRES_DB`       | Primary database name, will be created upon first container initialization.                                         |
| `POSTGRES_TEST_DB`  | Test database name, will be created when the container is initialized via the [pg-init](scripts/pg-init.sh) script. |
| `REDIS_URL`         | Hostname of the Redis server.                                                                                       |
| `REDIS_PORT`        | Port of the Redis server.                                                                                           |
| `REDIS_PASSWORD`    | Password for the Redis server.                                                                                      |

### Installation

Since this project is a monorepo, you must install the dependencies **at the root of the repository**, simply by running:

```bash
npm install
```

### Documentation

You should read our [Developer's Guide](/docs/README.md) to understand the overall architecture and view our ongoing project specifications.

You should also refer to project-specific documentation to configure the different projects:

- [API](/api/README.md)
- [Frontend](/frontend/README.md)
