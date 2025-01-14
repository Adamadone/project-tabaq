import { useState } from "react";
import { Button } from "../../../components/Button";
import { RoleGuard } from "../../../components/RoleGuard";
import { CreateCompanyDialog } from "./CreateCompanyDialog";
import { Card, CardSubTitle, CardTitle } from "../../../components/Card";
import { Link } from "react-router-dom";
import { useCompaniesQuery } from "../../../api/useCompaniesQuery";
import { DynamicContent } from "../../../components/DynamicContent";
import { Pagination } from "../../../components/Pagination";

export const CompaniesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);

  const companiesQuery = useCompaniesQuery();

  const handleNextPageClick = () => {
    setPageNumber((page) => {
      if (companiesQuery.data.pages.length <= page + 1)
        companiesQuery.fetchNextPage();

      return page + 1;
    });
  };

  const handlePrevPageClick = () => {
    setPageNumber((page) => page - 1);
  };

  const renderContent = (data) => {
    const page = data.pages[pageNumber];
    const hasNextPage = data.pages[pageNumber]?.hasNextPage;

    const mappedCompanies = page.results.map((company) => (
      <Link key={company.id} to={`/companies/${company.id}`}>
        <Card className="h-full">
          <CardTitle>{company.name}</CardTitle>
          <CardSubTitle>
            {company.description.substring(0, 20)}
            {company.description.length > 20 && "..."}
          </CardSubTitle>
        </Card>
      </Link>
    ));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappedCompanies}
        </div>
        <div className="pt-2">
          <Pagination
            pageNumber={pageNumber}
            hasNextPage={hasNextPage}
            onNextClick={handleNextPageClick}
            onPreviousClick={handlePrevPageClick}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <CreateCompanyDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      <RoleGuard requiredRole="admin">
        <div className="flex justify-center mb-4">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Přidat producenta
          </Button>
        </div>
      </RoleGuard>

      <DynamicContent {...companiesQuery} renderContent={renderContent} />
    </>
  );
};
