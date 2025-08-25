const Filter = ({ query, handler }) => {
  return (
    <div>
      filter shown with: <input value={query} onChange={handler} />
    </div>
  );
};

export default Filter;
