import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Place = { id: number; name: string; city: string; lat: number; lon: number };

type GeoState = {
  items: Place[];
  filter: string;
  selectedId?: number;
};

const initialState: GeoState = { items: [], filter: '' };

const geoSlice = createSlice({
  name: 'geo',
  initialState,
  reducers: {
    setItems: (s, a: PayloadAction<Place[]>) => { s.items = a.payload; },
    setFilter: (s, a: PayloadAction<string>) => { s.filter = a.payload; },
    select: (s, a: PayloadAction<number | undefined>) => { s.selectedId = a.payload; },
  },
});

export const { setItems, setFilter, select } = geoSlice.actions;

export const store = configureStore({
  reducer: { geo: geoSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
