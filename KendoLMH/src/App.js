import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import '@progress/kendo-theme-default/dist/all.css';
import './App.css';

const initialData = [
  { 
    category: 'Environment', 
    values: { 
      'Oil & Gas Drilling': '', 
      'Oil & Gas Equipment & Services': '', 
      'Integrated Oil & Gas': '', 
      'Oil & Gas Exploration & Production': '' 
    }, 
    isLeaf: false, 
    parentCategory: null,
    isExpanded: true
  },
  { 
    category: 'GHG Emissions', 
    values: { 
      'Oil & Gas Drilling': 'High', 
      'Oil & Gas Equipment & Services': 'Low', 
      'Integrated Oil & Gas': 'Medium', 
      'Oil & Gas Exploration & Production': '' 
    }, 
    isLeaf: true, 
    parentCategory: 'Environment'
  },
  // Add more sample data as needed
];

const treeData = {
  'Environment': [
    { text: 'GHG Emissions' },
    { text: 'Air Quality' },
    { text: 'Waste Management' }
  ],
  // Add more tree nodes as needed
};

const options = ['Low', 'Medium', 'High'];

const colorMap = {
  'Low': 'yellow',
  'Medium': 'orange',
  'High': 'red'
};

const App = () => {
  const [gridData, setGridData] = useState(initialData);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const calculateCounts = () => {
      const newCounts = {};
      gridData.forEach(item => {
        if (!item.isLeaf) {
          const children = gridData.filter(child => child.parentCategory === item.category);
          newCounts[item.category] = { 
            'Oil & Gas Drilling': { Low: 0, Medium: 0, High: 0 }, 
            'Oil & Gas Equipment & Services': { Low: 0, Medium: 0, High: 0 }, 
            'Integrated Oil & Gas': { Low: 0, Medium: 0, High: 0 }, 
            'Oil & Gas Exploration & Production': { Low: 0, Medium: 0, High: 0 } 
          };
          children.forEach(child => {
            Object.entries(child.values).forEach(([key, value]) => {
              if (value && newCounts[item.category][key]) {
                newCounts[item.category][key][value]++;
              }
            });
          });
        }
      });
      setCounts(newCounts);
    };

    calculateCounts();
  }, [gridData]);

  const handleCategoryClick = (category) => {
    const children = treeData[category.category] || [];
    const isExpanded = category.isExpanded;

    const updatedData = gridData.map(item => {
      if (item.category === category.category && item.isLeaf === false) {
        return { ...item, isExpanded: !isExpanded };
      }
      return item;
    });

    if (!isExpanded) {
      const childrenData = children.map(child => ({
        category: child.text,
        values: { 'Oil & Gas Drilling': '', 'Oil & Gas Equipment & Services': '', 'Integrated Oil & Gas': '', 'Oil & Gas Exploration & Production': '' },
        isLeaf: true,
        parentCategory: category.category
      }));

      const parentIndex = updatedData.findIndex(item => item.category === category.category);

      updatedData.splice(parentIndex + 1, 0, ...childrenData);
    } else {
      const filteredData = updatedData.filter(item => item.parentCategory !== category.category);
      setGridData(filteredData);
      return;
    }

    setGridData(updatedData);
  };

  const categoryCell = (props) => {
    const category = props.dataItem.category;
    const isLeaf = props.dataItem.isLeaf;
    const isExpanded = props.dataItem.isExpanded;
    return (
      <td>
        {!isLeaf ? (
          <span onClick={() => handleCategoryClick(props.dataItem)} style={{ cursor: 'pointer', color: 'blue' }}>
            {category} {isExpanded ? '-' : '+'}
          </span>
        ) : (
          <span style={{ paddingLeft: '20px' }}>{category}</span>
        )}
      </td>
    );
  };

  const itemRender = (li, itemProps) => {
    const selectedColor = colorMap[itemProps.dataItem];
    return React.cloneElement(li, {},
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ backgroundColor: selectedColor, width: '10px', height: '10px', marginRight: '5px' }}></span>
        {itemProps.dataItem}
      </span>
    );
  };

  const dropDownCell = (props) => {
    const selectedValue = props.dataItem.values[props.field];
    const selectedColor = colorMap[selectedValue];
  
    return (
      <td>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {selectedValue && (
            <div 
              style={{ 
                backgroundColor: selectedColor, 
                width: '10px', 
                height: '10px', 
                display: 'inline-block',
                marginRight: '5px'
              }}
            />
          )}
          <DropDownList
            data={options}
            value={selectedValue}
            itemRender={itemRender}
            onChange={(e) => {
              const updatedData = gridData.map(item => {
                if (item.category === props.dataItem.category) {
                  return {
                    ...item,
                    values: {
                      ...item.values,
                      [props.field]: e.target.value === props.dataItem.values[props.field] ? '' : e.target.value
                    }
                  };
                }
                return item;
              });
              setGridData(updatedData);
            }}
            onOpen={() => {
              props.dataItem.tempValue = props.dataItem.values[props.field];
            }}
            onClose={(e) => {
              if (e.target.value === props.dataItem.tempValue) {
                const updatedData = gridData.map(item => {
                  if (item.category === props.dataItem.category) {
                    return {
                      ...item,
                      values: {
                        ...item.values,
                        [props.field]: ''
                      }
                    };
                  }
                  return item;
                });
                setGridData(updatedData);
              }
              delete props.dataItem.tempValue;
            }}
          />
        </div>
      </td>
    );
  };

  const indicatorCell = (props) => {
    const category = props.dataItem.category;
    const field = props.field;
    const countsForCategory = counts[category] || { [field]: { Low: 0, Medium: 0, High: 0 } };
    const countsForField = countsForCategory[field] || { Low: 0, Medium: 0, High: 0 };
  
    if (props.dataItem.isLeaf) {
      return dropDownCell(props);
    }
  
    return (
      <td>
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-start' }}>
          {Object.entries(countsForField).map(([key, value]) => (
            <span 
              key={key}
              style={{ 
                backgroundColor: colorMap[key], 
                padding: '2px 5px', 
                borderRadius: '3px', 
                color: 'black',
                minWidth: '20px',
                textAlign: 'center'
              }}
            >
              {value}
            </span>
          ))}
        </div>
      </td>
    );
  };

  return (
    <div>
      <Grid data={gridData}>
        <GridColumn field="category" title="Category" cell={categoryCell} />
        <GridColumn field="values['Oil & Gas Drilling']" title="Oil & Gas Drilling" cell={indicatorCell} />
        <GridColumn field="values['Oil & Gas Equipment & Services']" title="Oil & Gas Equipment & Services" cell={indicatorCell} />
        <GridColumn field="values['Integrated Oil & Gas']" title="Integrated Oil & Gas" cell={indicatorCell} />
        <GridColumn field="values['Oil & Gas Exploration & Production']" title="Oil & Gas Exploration & Production" cell={indicatorCell} />
      </Grid>
    </div>
  );
};

export default App;