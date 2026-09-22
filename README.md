# React Microfrontend Architecture

This project contains three React applications using **Webpack 5 Module Federation**.

### Applications

* **Host App** – `http://localhost:3000`
* **Products App** – `http://localhost:3001`
* **Cart App** – `http://localhost:3002`

## Project Structure

```text
├── host/       # Main container application
├── products/   # Products microfrontend
├── cart/       # Cart microfrontend
├── package.json
└── README.md
```

## Tech Stack

* React 18
* Webpack 5
* Module Federation
* React Router
* Tailwind CSS
* Axios
* Yup

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/anmolbiranwar/VersionNextTask.git
cd VersionNextTask
```

### 2. Install dependencies

From the root folder:

```bash
npm run install:all
```

### 3. Start all applications

```bash
npm start
```

This will start:

```text
Host     → http://localhost:3000
Products → http://localhost:3001
Cart     → http://localhost:3002
```

Open:

```text
http://localhost:3000
```

From the Host App, you can navigate between **Products** and **Cart**.

## Module Federation

* Host loads `ProductsList` from the Products app.
* Host loads `CartList` from the Cart app.
* Products and Cart communicate using browser events and localStorage.

## Notes

Make sure **Node.js 18+** is installed before running the project.

`node_modules` is not included in the repository. Dependencies are installed using `npm run install:all`.
