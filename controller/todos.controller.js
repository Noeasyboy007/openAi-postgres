import { db } from '../db/index.js';
import { todosTable } from '../db/schema.js';
import { eq, ilike } from 'drizzle-orm';

export const getAllTodos = async () => {
    try {
        const todos = await db.select().from(todosTable);
        return JSON.stringify(todos);
    } catch (error) {
        return `Error fetching todos: ${error.message}`;
    }
};

export const createTodo = async (todoText) => {
    try {
        const newTodo = await db.insert(todosTable).values({ todo: todoText }).returning();
        return `Todo "${todoText}" created successfully`;
    } catch (error) {
        return `Error creating todo: ${error.message}`;
    }
};

export const searchTodo = async (query) => {
    try {
        const todos = await db.select().from(todosTable).where(ilike(todosTable.todo, `%${query}%`));
        if (todos.length === 0) {
            return `No todos found matching "${query}"`;
        }
        return JSON.stringify(todos);
    } catch (error) {
        return `Error searching todos: ${error.message}`;
    }
};

export const updateTodo = async (input) => {
    try {
        // Parse the input to extract id and todo
        const match = input.match(/ID (\d+) and update the task to '([^']+)'/);
        if (!match) {
            return "Invalid input format. Expected: 'ID X and update the task to 'New Task''";
        }
        
        const id = match[1];
        const todoText = match[2];
        
        await db.update(todosTable)
            .set({ todo: todoText })
            .where(eq(todosTable.id, id));
            
        return `Todo with ID ${id} updated to "${todoText}" successfully`;
    } catch (error) {
        return `Error updating todo: ${error.message}`;
    }
};

export const deleteTodoById = async (input) => {
    try {
        // Extract ID from input
        const match = input.match(/ID (\d+)/);
        if (!match) {
            return "Invalid input format. Expected: 'ID X'";
        }
        
        const id = match[1];
        
        await db.delete(todosTable)
            .where(eq(todosTable.id, id));
            
        return `Todo with ID ${id} deleted successfully`;
    } catch (error) {
        return `Error deleting todo: ${error.message}`;
    }
};






