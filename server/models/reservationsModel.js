const getClientReservations = async (client_id) => {
    const result = await pool.query(
        'SELECT * FROM reservations WHERE client_id = $1 AND datetime > NOW() ORDER BY datetime',
        [client_id]
    );
    return result.rows;
};
