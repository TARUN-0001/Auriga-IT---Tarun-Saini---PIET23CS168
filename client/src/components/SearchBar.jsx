const SearchBar = ({ value, onChange, placeholder = 'Search habits...' }) => (
  <div className="search-bar">
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default SearchBar;
