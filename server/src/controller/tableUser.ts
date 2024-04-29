import express, { Request, Response } from 'express';
import { UserModel } from '../models/user';  

// Define a custom interface to extend the Request type from Express
interface CustomRequest extends Request {
    query: {
      search?: string; // Optional search string
      page?: string;  // Optional page number as string
      limit?: string; // Optional limit number as string
    }
}

// Use the CustomRequest type for the request parameter
export const getTableUsers = async (req: CustomRequest, res: Response) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const search = req.query.search;
        const query = search ? {
          $or: [
            { username: new RegExp(search, 'i') },
            { firstName: new RegExp(search, 'i') },
            { lastName: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') }
          ]
        } : {};

        const users = await UserModel.find(query).skip(skip).limit(limit);
        const total = await UserModel.countDocuments(query);

        res.status(200).json({ users, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await UserModel.findOneAndDelete({_id: id});  
        if (result) {
            res.status(200).json({ message: 'User successfully deleted' });
        } else {
            res.status(404).json({ message: 'User not found' });  
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
}