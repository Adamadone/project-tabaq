import { useState } from "react";
import { Button } from "../../components/Button";
import { Table } from "../../components/Table";
import { RoleDialog } from "./RoleDialog";

import { Pagination } from "../../components/Pagination";
import { DynamicContent } from "../../components/DynamicContent";
import { useUsersQuery } from "../../api/useUsersQuery";
import { Card } from "../../components/Card";

const rowIdExtractor = (user) => user.id;

export const UsersPage = () => {
  const [userIdToChangeRole, setUserIdToChangeRole] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);

  const query = useUsersQuery();

  const columns = [
    {
      id: "id",
      title: "Id",
      render: (user) => user.id,
    },
    {
      id: "name",
      title: "Jméno",
      render: (user) => user.name,
    },
    {
      id: "role",
      title: "Role",
      render: (user) =>
        user.role.toLowerCase() === "admin" ? "Admin" : "Uživatel",
    },
    {
      id: "actions",
      title: "Akce",
      render: (user) => {
        const handleClick = () => {
          setUserIdToChangeRole(user.id);
        };
        return (
          <Button variant="ghost" onClick={handleClick}>
            Změnit roli
          </Button>
        );
      },
    },
  ];

  const handleDialogClose = () => {
    setUserIdToChangeRole(null);
  };

  const handleNextPageClick = () => {
    setPageNumber((page) => {
      if (query.data.pages.length <= page + 1) query.fetchNextPage();

      return page + 1;
    });
  };

  const handlePrevPageClick = () => {
    setPageNumber((page) => page - 1);
  };

  const renderContent = (data) => {
    const page = data.pages[pageNumber];
    const userToChangeRole =
      userIdToChangeRole &&
      page.results.find((user) => user.id === userIdToChangeRole);
    const hasNextPage = data.pages[pageNumber]?.hasNextPage;

    return (
      <>
        <RoleDialog user={userToChangeRole} onClose={handleDialogClose} />

        <Card>
          <Table
            data={page.results}
            columns={columns}
            rowIdExtractor={rowIdExtractor}
          />
          <div className="pt-2">
            <Pagination
              pageNumber={pageNumber}
              hasNextPage={hasNextPage}
              onNextClick={handleNextPageClick}
              onPreviousClick={handlePrevPageClick}
            />
          </div>
        </Card>
      </>
    );
  };
  return <DynamicContent {...query} renderContent={renderContent} />;
};
