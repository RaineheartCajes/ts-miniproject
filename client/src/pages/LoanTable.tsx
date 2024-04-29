import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import debounce from 'debounce';  

type Loan = {
  username: string;
  loanAmount: number;
  loanType: string;
  isDocumentAvailable: boolean;
  pdfUrl: string;
};

const PAGE_LIMIT = 6; 

const LoanTable: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSetSearchTerm = useRef(debounce((searchValue) => {
    setSearchTerm(searchValue);
  }, 300)).current; 

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/loans`, {
          params: {
            search: searchTerm,
            limit: PAGE_LIMIT,
            page: currentPage
          }
        });

        setLoans(response.data);
        setTotalPages(Math.ceil(response.data.length / PAGE_LIMIT));
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchLoans();
  }, [searchTerm, currentPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(event.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container mt-5">
      <h1>Loan Lists</h1>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by username or loan type..."
        onChange={handleSearchChange}
      />
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Loan Amount</th>
            <th>Loan Type</th>
            <th>Document Available</th>
            <th>PDF File</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan, index) => (
            <tr key={index}>
              <td>{loan.username}</td>
              <td>{loan.loanAmount}</td>
              <td>{loan.loanType}</td>
              <td style={{ color: loan.isDocumentAvailable ? 'green' : 'red', fontWeight: 'bold' }}>
                {loan.isDocumentAvailable ? 'Yes' : 'No'}
              </td>
              <td>
                {loan.isDocumentAvailable && loan.pdfUrl && (
                  <a href={`http://localhost:5173/uploads/${loan.pdfUrl}`} download>
                    Download PDF
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button onClick={() => handlePageChange(index + 1)} className="page-link">
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default LoanTable;
