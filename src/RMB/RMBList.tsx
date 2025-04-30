import * as React from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { createTheme } from '@mui/material/styles';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useNavigate, useLocation, useParams } from 'react-router-dom'; 

import {
    Crud,
    Create,
    CrudProvider,
    DataModel,
    DataSource,
    DataSourceCache,
    Edit,
    List,
    Show,
  } from '@toolpad/core/Crud';
import { DataGrid } from '@mui/x-data-grid';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    startAfter,
    where,
    Timestamp,
    getFirestore,
  } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const vehiclesCollection = collection(db, 'vehicles');
  




export interface Vehicle extends DataModel {
  id: string;
  plateNumber: string;
  location: string;
  type: string;
  gps: boolean;
  roadTaxExpiry: string; // ISO date
  model: string;
}



export const vehiclesDataSource: DataSource<Vehicle> = {
    fields: [
        { field: 'id', headerName: 'ID' },
        { field: 'plateNumber', headerName: 'Plate Number', flex: 1 },
        { field: 'location', headerName: 'Location', flex: 1 },
        { field: 'type', headerName: 'Type', flex: 1 },
        { field: 'gps', headerName: 'GPS', type: 'boolean' },
        {
            field: 'roadTaxExpiry',
            headerName: 'Road Tax Expiry',
            type: 'date',
            valueGetter: (params) => {
              const expiry = params?.row?.roadTaxExpiry;
              return expiry?.toDate ? expiry.toDate() : expiry ?? null;
            },
          },
        { field: 'model', headerName: 'Model', flex: 1 },
      ],
      
  
    getMany: async ({ paginationModel }) => {
      const pageSize = paginationModel.pageSize;
      const offset = paginationModel.page * pageSize;
  
      const q = query(vehiclesCollection, orderBy('plateNumber'), limit(1000));
      const snapshot = await getDocs(q);
      const allDocs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Vehicle[];
  
      return {
        items: allDocs.slice(offset, offset + pageSize),
        itemCount: allDocs.length,
      };
    },
  
    getOne: async (id) => {
      const ref = doc(vehiclesCollection, id);
      const docSnap = await getDoc(ref);
      if (!docSnap.exists()) {
        throw new Error('Vehicle not found');
      }
      return { id: docSnap.id, ...docSnap.data() } as Vehicle;
    },
  
    createOne: async (data) => {
      const docRef = await addDoc(vehiclesCollection, data);
      const newDoc = await getDoc(docRef);
      return { id: newDoc.id, ...newDoc.data() } as Vehicle;
    },
  
    updateOne: async (id, data) => {
      const ref = doc(vehiclesCollection, id);
      await updateDoc(ref, data);
      const updatedDoc = await getDoc(ref);
      return { id: updatedDoc.id, ...updatedDoc.data() } as Vehicle;
    },
  
    deleteOne: async (id) => {
      const ref = doc(vehiclesCollection, id);
      await deleteDoc(ref);
    },
  
    validate: (values) => {
      const issues = [];
      if (!values.plateNumber) issues.push({ message: 'Plate Number is required', path: ['plateNumber'] });
      if (!values.model) issues.push({ message: 'Model is required', path: ['model'] });
      if (!values.roadTaxExpiry) issues.push({ message: 'Road Tax Expiry is required', path: ['roadTaxExpiry'] });
      return { issues };
    },
  };
  

const vehiclesCache = new DataSourceCache();

function matchPath(pattern: string, pathname: string): string | null {
  const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

export default function RMBList() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();


  const title = React.useMemo(() => {
    if (location.pathname === '/vehicles/new') return 'New Vehicle';
    const editId = matchPath('/vehicles/:vehicleId/edit', location.pathname);
    if (editId) return `Edit Vehicle ${editId}`;
    const showId = matchPath('/vehicles/:vehicleId', location.pathname);
    if (showId) return `Vehicle ${showId}`;
    return undefined;
  }, [location.pathname]);

  const rootPath = '/vehicles';
  const listPath = rootPath;
  const showPath = `${rootPath}/:vehicleId`;
  const createPath = `${rootPath}/new`;
  const editPath = `${rootPath}/:vehicleId/edit`;

  const handleRowClick = React.useCallback(
    (vehicleId: string | number) => {
      navigate(`${rootPath}/${String(vehicleId)}`);
    },
    [location],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate(createPath);
  }, [createPath, location]);

  const handleEditClick = React.useCallback(
    (vehicleId: string | number) => {
      navigate(`${rootPath}/${String(vehicleId)}/edit`);
    },
    [location],
  );

  const handleCreate = React.useCallback(() => {
    navigate(listPath);
  }, [listPath, location]);

  const handleEdit = React.useCallback(() => {
    navigate(listPath);
  }, [listPath, location]);

  const handleDelete = React.useCallback(() => {
    navigate(listPath);
  }, [listPath, location]);

  const showVehicleId = matchPath(showPath, location.pathname);
  const editVehicleId = matchPath(editPath, location.pathname);


  return (
    
      <CrudProvider<Vehicle>
        dataSource={vehiclesDataSource}
        dataSourceCache={vehiclesCache}
      >
        {location.pathname === listPath ? (
          <List<Vehicle>
            initialPageSize={10}
            onRowClick={handleRowClick}
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            slots={{ dataGrid: DataGrid }}
            slotProps={{
              dataGrid: {
                showToolbar: true,
                onRowClick: (params) => handleRowClick(params.row.id),
                initialState: {
                  columns: {
                    columnVisibilityModel: {
                      
                      id: false,
                      gps: false,
                      roadTaxExpiry: false,
                      type: false,
                    },
                  },
                },
              },
            }}
          />
        ) : null}
        {location.pathname === createPath ? (
          <Create<Vehicle>
            initialValues={{ title: 'New vehicle' }}
            onSubmitSuccess={handleCreate}
            resetOnSubmit={false}
          />
        ) : null}
        {location.pathname !== createPath && showVehicleId ? (
          <Show<Vehicle>
            id={showVehicleId}
            onEditClick={handleEditClick}
            onDelete={handleDelete}
          />
        ) : null}
        {editVehicleId ? (
          <Edit<Vehicle> id={editVehicleId} onSubmitSuccess={handleEdit} />
        ) : null}
      </CrudProvider>
  
  );
}
