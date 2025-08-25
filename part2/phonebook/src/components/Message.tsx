const Message = ({ message }) => {
  if (message === null) {
    return null;
  }
  if (message.type === "error") {
    return <div className="error">{message.message}</div>;
  }
  if (message.type === "success") {
    return <div className="success">{message.message}</div>;
  }
  return null;
}

export default Message;