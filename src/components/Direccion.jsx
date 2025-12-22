import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import { cn } from "@/lib/utils"; 
export function UbigeoPicker({
    data,
    dataUrl = "/data.json",
    value,
    onChange,
    placeholders = {
        departamento: "Seleccione departamento",
        provincia: "Seleccione provincia",
        distrito: "Seleccione distrito",
    },
    disabled = false,
    className = "",
}) {
    const [store, setStore] = useState(data ?? null);

    const depId = value?.departamentoId;
    const provId = value?.provinciaId;
    const distId = value?.distritoId;

    // Cargar datos si no se pasaron por props
    useEffect(() => {
        if (store || !dataUrl || data) return;
        (async () => {
            const res = await fetch(dataUrl);
            const json = await res.json();
            setStore(json);
        })();
    }, [data, dataUrl, store]);

    // Si recibimos data por props, sincronizamos
    useEffect(() => {
        if (data) setStore(data);
    }, [data]);

    // Helpers para resolver nombres
    const getDepById = (id) => (store ?? []).find((d) => d.id === id);
    const getProvById = (dep, id) => dep?.provincias?.find((p) => p.id === id);
    const getDistById = (prov, id) => prov?.distritos?.find((d) => d.id === id);

    // Derivados para opciones
    const departamentos = useMemo(
        () => (store ?? []).map((d) => ({ label: d.name, value: d.id })),
        [store]
    );
    const currentDep = useMemo(() => getDepById(depId), [store, depId]);
    const provincias = useMemo(
        () => (currentDep?.provincias ?? []).map((p) => ({ label: p.name, value: p.id })),
        [currentDep]
    );
    const currentProv = useMemo(() => getProvById(currentDep, provId), [currentDep, provId]);
    const distritos = useMemo(
        () => (currentProv?.distritos ?? []).map((d) => ({ label: d.name, value: d.id })),
        [currentProv]
    );

    // Handlers que devuelven IDs + nombres
    const emit = (nextIds) => {
        const dep = getDepById(nextIds.departamentoId);
        const prov = getProvById(dep, nextIds.provinciaId);
        const dist = getDistById(prov, nextIds.distritoId);
        onChange({
            ...nextIds,
            departamento: dep?.name.toUpperCase(),
            provincia: prov?.name.toUpperCase(),
            distrito: dist?.name.toUpperCase(),
        });
    };

    const handleDepChange = (newDepId) => {
        emit({
            departamentoId: newDepId,
            provinciaId: undefined,
            distritoId: undefined,
        });
    };

    const handleProvChange = (newProvId) => {
        emit({
            departamentoId: depId,
            provinciaId: newProvId,
            distritoId: undefined,
        });
    };

    const handleDistChange = (newDistId) => {
        emit({
            departamentoId: depId,
            provinciaId: provId,
            distritoId: newDistId,
        });
    };

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
            <div className="space-y-1">
                <p className="text-sm">Departamento</p>
                <Select
                    showSearch
                    optionFilterProp="label"
                    className="w-full"
                    placeholder={placeholders.departamento}
                    options={departamentos}
                    value={depId}
                    onChange={handleDepChange}
                    disabled={disabled || !store}
                />
            </div>
            <div className="space-y-1">
                <p className="text-sm">Provincia</p>
                <Select
                    showSearch
                    optionFilterProp="label"
                    className="w-full"
                    placeholder={placeholders.provincia}
                    options={provincias}
                    value={provId}
                    onChange={handleProvChange}
                    disabled={disabled || !depId}
                />
            </div>

            <div className="space-y-1">
                <p className="text-sm">Distrito</p>
                <Select
                    showSearch
                    optionFilterProp="label"
                    className="w-full"
                    placeholder={placeholders.distrito}
                    options={distritos}
                    value={distId}
                    onChange={handleDistChange}
                    disabled={disabled || !provId}
                />
            </div>
        </div>
    );
}
