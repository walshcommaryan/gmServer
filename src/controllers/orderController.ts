import { Request, Response} from "express";
import orderService from "../services/orderService";
import { Order } from "../models/Order";

interface OrderParams {
  orderId: string;
}

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      status,
      orderDate,
      totalAmount,
      sortBy,
      order,
    } = req.query;

    const filters = {
      customerId: customerId ? Number(customerId) : undefined,
      status: status as string | undefined,
      orderDate: orderDate as string | undefined, // Format: 'YYYY-MM-DD'
      totalAmount: totalAmount ? Number(totalAmount) : undefined,
    };

    const sortOptions = {
      sortBy: sortBy as string | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    };

    const orders = await orderService.getAllOrders(filters, sortOptions);
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch orders');
  }
};


const getOneOrder = async (req: Request<OrderParams>, res: Response): Promise<void> => {
    const { orderId } = req.params;
    try {
        const order = await orderService.getOneOrder(orderId);
        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to fetch orderId ${orderId}`);
    }
};

const createOneOrder = async (req: Request<{}, {}, Order>, res: Response): Promise<void> => {
    const newOrder = req.body;

    try {
        const createdOrder = await orderService.createOneOrder(newOrder);
        res.status(201).json(createdOrder);
    } catch(error) {
        console.log(error);
        res.status(500).send(`Failed to create order with ID ${newOrder.order_id}`)
    }
};

const updateOneOrder = async (req: Request<{}, {}, Order>, res: Response): Promise<void> => {
    const modifiedOrder = req.body;
    try {
        if (!modifiedOrder.order_id) {
            res.status(404).json("Order ID not found.");
        }
        const updatedOrder = await orderService.updateOneOrder(modifiedOrder);

        if (!updatedOrder) {
            res.status(404).json("Order ID not found.");
        }
        
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to update order with ID ${modifiedOrder.order_id}`)
    }
};

const deleteOneOrder = async (req: Request<OrderParams>, res: Response): Promise<void> => {
    const { orderId } = req.params;
    
    try {
        const deleted = await orderService.deleteOneOrder(orderId);
        if (deleted.affectedRows > 0) {
            res.status(202).send(`Order ${orderId} deleted successfully`);
        } else {
            res.status(404).send(`Order ${orderId} not found`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to delete order with ID ${orderId}`)
    }

};

export default {
  getAllOrders,
  getOneOrder,
  createOneOrder,
  updateOneOrder,
  deleteOneOrder,
};
