# Goal
Create a task management tool with focus on taks visualization and reports
- Problem: at the moment my team is dealing with a task manager and we dont know with shure with must be made, the tasks that has been left aside and what eachother is doing. plus, we must show to our boss what we've made during some period

you must develop a mvp software, only with basic functions to menage this tasks and easy undertanding interface

# Infra

## Frondend 

Use react + vite as frontend. Split it into the layer:
- services (api calls)
- hooks
- pages

## Interface
This is an admin project, include some sort of metrics that show situation and type of tasks in the homepage
add in the home page a "for me" list 
Add a sidebar and a topbar on the layout

## Backend
Use the already implemented pattern in /api to build the backend
The backend is a rest api built with go and gin with sqlc to create queries
Separate the project with the following layers:
  - handlers
  - services
  - repositories
The services must rely solely on interfaces

# Domain and Business

consider the following:
- Users
- Projects
- Tasks
- Tasks Movimentations
- Tasks Files
- Tasks situations
- Tasks Types

As a user i want to: 
  - log into the service
  - attch a task to another user when i'am craeting a new one or even if it is already created
  - see all pending and running tasks on a list and with a filter choose to list the rest of them and other users task
  - easily create or remove situations or types for the tasks
  - attach a file and project while i'am creating a new task
  - add a description to the task as html with a rich editor
  - when creating a situation, decide if this situation is a removal one, if it is, must not show the task in the "pending and running list"
  - create a movimentation with details in rich text
  - all tasks situation must allow me to undo the changes ive done to it.

## Authentication
  use Jwt access and refresh (2min) tokens (30d)
  the password must be hashed as bcrypt with cost 8  

## Files
The files must be stored in a instance of minios3
A task can contain many files, because of that, files must be sent to the server as the users select it
The file will be temporary writen in /temp, return its uuids to the form and then the form uuids are sent to the server within the form and moved from /temp to another folder and its paths stored in "Tasks Files" table in the database
To see the files, the server will request a signed url to minios3


## Happy path
- The user-1 logs into the app
- The user-1 create a task and attaches to user-2
- User-2 receives the task and finishes removing from the task list

# Important
variables, functions, sctructs, database tables and columns and so on must be written with brazilian portuguese names
All services that implement some kind of infrastructure logic like repositories or file storages must have an interface
This is a mvp, only basic functions must be implemented