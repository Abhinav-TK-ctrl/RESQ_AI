import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceItem } from '../types';
import { Box, Plus, RefreshCw, AlertTriangle, CheckCircle, Search, Truck, X } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const { resources, allocateResource, addToast } = useApp();
  const [filterCat, setFilterCat] = useState<string>('all');
  const [requestModal, setRequestModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState<ResourceItem | null>(null);
  const [quantity, setQuantity] = useState<number>(10);
  const [targetSector, setTargetSector] = useState<string>('Wayanad Chooralmala Relief Base');

  const filtered = resources.filter(
    (r) => filterCat === 'all' || r.category === filterCat
  );

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;
    if (quantity <= 0 || quantity > selectedRes.availableQuantity) {
      addToast(
        'Invalid Quantity',
        `Please specify between 1 and ${selectedRes.availableQuantity} ${selectedRes.unit}.`,
        'error'
      );
      return;
    }

    const success = allocateResource(selectedRes.id, quantity, targetSector);
    if (success) {
      addToast(
        'Resource Dispatched Successfully',
        `Allocated ${quantity} ${selectedRes.unit} of ${selectedRes.name} to ${targetSector}. Warehouse inventory decremented.`,
        'success'
      );
      setRequestModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              Emergency Resource & Supply Chain Hub
            </h1>
            <p className="text-xs text-zinc-500">
              Live inventory tracking across regional depots for clean water, medical kits, and generators.
            </p>
          </div>
          <button
            onClick={() => setRequestModal(true)}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow"
          >
            + Request Resource Dispatch
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 text-xs font-medium pt-2">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterCat === 'all'
                ? 'bg-orange-500/10 border-orange-500 text-orange-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setFilterCat('medical')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterCat === 'medical'
                ? 'bg-orange-500/10 border-orange-500 text-orange-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            Medical Equipment
          </button>
          <button
            onClick={() => setFilterCat('food_water')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterCat === 'food_water'
                ? 'bg-orange-500/10 border-orange-500 text-orange-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            Food & Water
          </button>
          <button
            onClick={() => setFilterCat('power_fuel')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterCat === 'power_fuel'
                ? 'bg-orange-500/10 border-orange-500 text-orange-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            Power Generators
          </button>
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => {
          const percent = Math.round((res.availableQuantity / res.totalQuantity) * 100);
          return (
            <div
              key={res.id}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase font-bold">
                  {res.category.replace('_', ' ')}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    res.urgencyToReplenish === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {res.urgencyToReplenish} REPLENISH
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  {res.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">{res.hubLocation} • {res.sector}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Available:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {res.availableQuantity} / {res.totalQuantity} {res.unit}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      percent < 25 ? 'bg-red-500' : percent < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedRes(res);
                  setQuantity(Math.min(25, res.availableQuantity));
                  setRequestModal(true);
                }}
                disabled={res.availableQuantity <= 0}
                className={`w-full py-2.5 font-bold text-xs rounded-xl shadow transition-all ${
                  res.availableQuantity <= 0
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                {res.availableQuantity <= 0 ? 'Stock Depleted' : 'Allocate & Dispatch Stock'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Allocation Modal */}
      {requestModal && selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full text-zinc-100 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRequestModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-orange-400">
              <Truck className="w-5 h-5" />
              <h3 className="font-bold text-base">Authorize Resource Dispatch</h3>
            </div>

            <p className="text-xs text-zinc-400">
              Transfer relief assets from storage hub to frontline camp. Warehouse inventory is decremented instantly.
            </p>

            <div className="p-3.5 bg-zinc-800/80 rounded-xl border border-zinc-700 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Resource:</span>
                <span className="font-bold text-zinc-100">{selectedRes.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Hub Origin:</span>
                <span className="font-mono text-zinc-300">{selectedRes.hubLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Current Available:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedRes.availableQuantity} {selectedRes.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleAllocate} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Target Destination Sector / Relief Camp</label>
                <select
                  value={targetSector}
                  onChange={(e) => setTargetSector(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="Wayanad Chooralmala Relief Base">Wayanad Chooralmala Relief Base</option>
                  <option value="Alappuzha Kuttanad Champakulam Camp">Alappuzha Kuttanad Champakulam Camp</option>
                  <option value="Idukki Munnar Emergency Relief Camp">Idukki Munnar Emergency Relief Camp</option>
                  <option value="Thrissur Chalakudy Relief Center">Thrissur Chalakudy Relief Center</option>
                  <option value="Kozhikode Beach General Hospital Hub">Kozhikode Beach General Hospital Hub</option>
                  <option value="Malappuram Nilambur Base Camp">Malappuram Nilambur Base Camp</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">
                  Quantity to Dispatch ({selectedRes.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedRes.availableQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-100 focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-zinc-400 font-mono">
                  Max available: {selectedRes.availableQuantity} {selectedRes.unit}
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRequestModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Authorize Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
