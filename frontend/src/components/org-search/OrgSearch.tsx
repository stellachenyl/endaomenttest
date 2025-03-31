import './OrgSearch.css';
import { useSearch } from '../../utils/useSearch';
import { getEndaomentUrls } from '../../utils/endaoment-urls';

export const OrgSearch = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Manage search term state
  const [searchResults, setSearchResults] = useState([]); // State to store the search results
  const [isLoading, setIsLoading] = useState(false); // Loading state for the request
  const [error, setError] = useState<string | null>(null); // Error handling state

  // Handle search on button click or Enter key press
  const handleSearch = async () => {
    setIsLoading(true); // Set loading to true before the API call
    setError(null); // Reset previous errors
    try {
      // Prepare the search URL for Endaoment API
      const searchUrl = `https://api.endaoment.com/v2/orgs/search?searchTerm=${searchTerm}`;

      // Make the fetch request
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();

      // Set search results in the state
      setSearchResults(data);
    } catch (error) {
      console.error(error);
      setError('Error fetching search results'); // Set error message on failure
    } finally {
      setIsLoading(false); // Set loading to false after the request is done
    }
  };
  
  // Trigger search when user presses Enter or clicks the Search button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <input
        className="org-search-input"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        onBlur={submitSearch}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitSearch();
        }}
      />
      <button type="button" onClick={submitSearch}>
        Search
      </button>
      <div className="org-list">
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          data?.pages.map((page) =>
            page.map((org) => (
              <div key={org.ein ?? org.id} className="org-listing">
                <img src={org.logo} alt={org.logo ? org.name : ''} />
                <a href={`${getEndaomentUrls().app}/orgs/${org.ein ?? org.id}`}>
                  {org.name}
                </a>
                <p>{org.description}</p>
              </div>
            ))
          )
        )}
        {hasNextPage &&
          (isFetchingNextPage ? (
            <span>Loading...</span>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              type="button"
              className="load-more-button">
              Load More
            </button>
          ))}
      </div>
    </>
  );
};
