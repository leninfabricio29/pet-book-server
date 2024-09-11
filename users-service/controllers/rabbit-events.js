// user-service.js (Microservicio de Usuarios)
const amqp = require('amqplib');

const publishUserDeletedEvent = async (userId) => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'user_deleted';

        await channel.assertQueue(queue, { durable: true });
        const message = JSON.stringify({ userId });
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

        console.log(`Evento publicado: Usuario ${userId} eliminado`);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error al publicar evento:', error);
    }
};

