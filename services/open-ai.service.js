import OpenAI from "openai";
import readlineSync from 'readline-sync';

const client = new OpenAI();

import { createTodo, deleteTodoById, getAllTodos, searchTodo, updateTodo } from '../controller/todos.controller.js'

const tools = {
    getAllTodos: getAllTodos,
    createTodo: createTodo,
    searchTodo: searchTodo,
    updateTodo: updateTodo,
    deleteTodoById: deleteTodoById
}

const SYSTEM_PROMPT = `

You are an AI To-Do Assistant With START, PLAN, ACTION, OBSERVATION and OUTPUT State.
Wait for the user prompt and first PLAn using available tools.
After Planning, take the action with appropriate tools and wait for Observation based on Action.
Once you get the Observation, update the Plan and wait for the next Observation.
Once you get the Output, wait for the user prompt again.


You can manage tasks by adding, viewing, updating and deleting tasks. You must strictly follw the JSON output format.


Todo DB Schema:
id: Int and is the primary key of the table.
todo: String and is the task that the user wants to add.
completed: Boolean and is the status of the task.
created_at: Date and is the date and time when the task was created.
updated_at: Date and is the date and time when the task was last updated.


Available Tools:
-getAllTodos(): This tool is used to get all Todos from the database.
-createTodo(todo: string): This tool is used to create a new Todo in the database and takes a string as input.
-searchTodo(query: string): This tool is used to get a Todo from the database by its search query and takes a string as input.
-updateTodo(id: string, todo: string): This tool is used to update a Todo from the database by its id and takes a string as input.
-updatedAt(id: string): This tool is used to delete a Todo from the database by its id and takes a string as input.

Example :
START
{"type": "user", "user": "Add a task for shopping groceries"}

PLAN
{"type": "plan", "plan": "I will try to get more  context on what user needs to shop"}

OUTPUT
{"type": "output", "output": "Can you please provide more details on what you need to shop?"}

USER
{"type": "user", "user": "I need to buy groceries, fruits, vegetables, and some other items"}

PLAN
{"type": "plan", "plan": "I will use createTodo to add a task for shopping groceries to the database"}

ACTION
{"type": "action", "function": "createTodo", "input" : "I will use createTodo to add a task for shopping groceries to the database"}

OBSERVATION
{"type": "observation", "observation": "I have added a task for shopping groceries to the database"}

OUTPUT
{"type": "output", "output": "Can you please provide more details on what you need to shop?"}

USER
{"type": "user", "user": "I need to buy groceries, fruits, vegetables, and some other items"}


OUTPUT
{"type": "output", "output": "The task 'Shopping groceries' has been added successfully."}

---
Example for updateTodo:

START
{"type": "user", "user": "Update my task 'Shopping groceries' to 'Buy weekly groceries'"}

PLAN
{"type": "plan", "plan": "I will search for the task 'Shopping groceries' in the database."}

ACTION
{"type": "action", "function": "searchTodo", "input": "I will use searchTodo to find 'Shopping groceries' in the database."}

OBSERVATION
{"type": "observation", "observation": "I found the task with ID 5: 'Shopping groceries'."}

PLAN
{"type": "plan", "plan": "I will update the task ID 5 to 'Buy weekly groceries'."}

ACTION
{"type": "action", "function": "updateTodo", "input": "I will use updateTodo with ID 5 and update the task to 'Buy weekly groceries'."}

OBSERVATION
{"type": "observation", "observation": "The task has been updated successfully."}

OUTPUT
{"type": "output", "output": "The task has been updated to 'Buy weekly groceries'."}

`;


const message = [{ role: "system", content: SYSTEM_PROMPT }]


while (true) {
    const query = readlineSync.question(">>>>");
    const userMessage = { type: "user", user: query }
    message.push({ role: "user", content: JSON.stringify(userMessage) })

    while (true) {
        const chat = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: message,
            // tools: tools,
            // tool_choice: "auto"
            response_format: { type: "json_object" }
        })
        const result = chat.choices[0].message.content
        message.push({ role: "assistant", content: result })
        
        const action = JSON.parse(result)
        if (action.type === "output") {
            console.log(`⏩ : ${action.output}`)
            break;
        } else if (action.type === "action") {
            const fn = tools[action.function]
            if (!fn) throw new Error('❌ Invalid Tool Call')

            const observation = await fn(action.input)

            const observationMessage = { type: "observation", observation: observation }

            message.push({ role: "Developer", content: JSON.stringify(observationMessage) })
        }
    }
}