import { Request, Response} from "express";
import orderService from "../services/orderService";
import { Order } from "../models/Order";

interface OrderParams {
  order_id: number;
}

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id, customer_id, status, order_date, total_amount, sortBy, order } = req.query;

    const orderIdNum = Number(order_id);
    const customerIdNum = Number(customer_id);
    const filters = {
        order_id: !isNaN(orderIdNum) ? orderIdNum : undefined,
        customer_id: !isNaN(customerIdNum) ? customerIdNum : undefined,
        status: status as string | undefined,
        order_date: order_date as string | undefined,
        total_amount: total_amount ? Number(total_amount) : undefined,
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
    const { order_id } = req.params;
    try {
        const order = await orderService.getOneOrder(Number(order_id));
        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to fetch order_id ${order_id}`);
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
    const { order_id } = req.params;
    
    try {
        const deleted = await orderService.deleteOneOrder(order_id);
        if (deleted.affectedRows > 0) {
            res.status(202).send(`Order ${order_id} deleted successfully`);
        } else {
            res.status(404).send(`Order ${order_id} not found`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to delete order with ID ${order_id}`)
    }

};

export default {
  getAllOrders,
  getOneOrder,
  createOneOrder,
  updateOneOrder,
  deleteOneOrder,
};
