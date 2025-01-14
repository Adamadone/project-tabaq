import { useParams } from "react-router-dom";
import { Card, CardSubTitle, CardTitle } from "../../../components/Card";
import { Icon } from "../../../components/Icon";
import { Button } from "../../../components/Button";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useCompanyQuery } from "../../../api/useCompanyQuery";
import { DynamicContent } from "../../../components/DynamicContent";
import { UpdateCompanyDialog } from "./UpdateCompanyDialog";
import { useState } from "react";
import { RoleGuard } from "../../../components/RoleGuard";
import { DeleteCompanyDialog } from "./DeleteCompanyDialog";
import { ProductsList } from "../../../components/ProductsList";

export const CompanyPage = () => {
  const id = +useParams().id;

  const companyQuery = useCompanyQuery({ id });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const renderContent = (company) => {
    return (
      <>
        <UpdateCompanyDialog
          isOpen={isUpdating}
          company={company}
          onClose={() => setIsUpdating(false)}
        />
        <DeleteCompanyDialog
          isOpen={isDeleting}
          companyId={company.id}
          onClose={() => setIsDeleting(false)}
        />
        <Card>
          <div className="flex">
            <div className="grow">
              <CardTitle>{company.name}</CardTitle>
            </div>
            <div className="flex gap-2">
              <RoleGuard requiredRole="admin">
                <Button
                  variant="ghost"
                  circle
                  onClick={() => setIsDeleting(true)}
                >
                  <Icon size="sm" variant="error">
                    <TrashIcon />
                  </Icon>
                </Button>
              </RoleGuard>
              <RoleGuard requiredRole="admin">
                <Button
                  variant="ghost"
                  circle
                  onClick={() => setIsUpdating(true)}
                >
                  <Icon size="sm">
                    <PencilIcon />
                  </Icon>
                </Button>
              </RoleGuard>
            </div>
          </div>
          {company.description}
        </Card>

        <div className="mt-6">
          <h2 className="font-bold text-xl mb-4">Produkty:</h2>
          <ProductsList companyId={company.id} />
        </div>
      </>
    );
  };

  return <DynamicContent {...companyQuery} renderContent={renderContent} />;
};
