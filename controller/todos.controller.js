import { db } from '../db/index.js';
import { todosTable } from '../db/schema.js';
import { eq, ilike } from 'drizzle-orm';

export const getAllTodos = async (req, res) => {
    const todos = await db.select().from(todosTable)
    res.status(200).json(todos);
};

export const createTodo = async (req, res) => {
    const { todo } = req.body;
    const newTodo = await db.insert(todosTable).values({ todo });
    res.status(201).json({ message: 'Todo created successfully', todo: newTodo });
};

export const searchTodo = async (req, res) => {
    const { query } = req.params;
    const todo = await db.select().from(todosTable).where(ilike(todosTable.todo, query));
    res.status(200).json({ message: 'Todo fetched successfully by id', todo: todo });
};

export const updateTodo = async (req, res) => {
    const { id } = req.params;
    const { todo } = req.body;
    const updatedTodo = await db.update(todosTable).set({ todo }).where(eq(todosTable.id, id));
    res.status(200).json({ message: 'Todo updated successfully by id', todo: updatedTodo });
};
export const deleteTodoById = async (req, res) => {
    const { id } = req.params;
    const todo = await db.delete(todosTable).where(eq(todosTable.id, id));
    res.status(200).json({ message: 'Todo deleted successfully by id', todo: todo });
};






