import numpy as np
import pandas as pd
import scipy
from sklearn.preprocessing import OrdinalEncoder
import xarray as xr

def build_win_feature(dataset, windows, mode, window_name):
    
    features = pd.DataFrame()
    value_mean = dataset.mean()
    dataset = pd.DataFrame(dataset)
    
    for column in dataset:
        i = 0

        for win in windows:
            
            name = column + ' ' + str(window_name[i])
            i = i + 1
            # Rolling Sum for precipitation or conflict / Rolling mean for the rest
            
            if mode == 'sum':
                dataset[name] = dataset[column].rolling(win).sum()

            if mode == 'mean':
                dataset[name]= dataset[column].rolling(win).mean()
                          
    return dataset


def build_lag_feature(dataset, lags):
    
    features = pd.DataFrame()
    dataset = pd.DataFrame(dataset)
    
    for column in dataset:
        i = 0

        for lag in lags:
            name = column + ' ' + 'lag' + str(lags[i])
            i = i + 1
            lagged_column = dataset[column].shift(lag).rename(name)
            dataset = pd.concat([dataset, lagged_column], axis=1)
            # dataset[name] = dataset[column].shift(lag)
                                             
    return dataset


def aggregate_best_market(market_dataframe):

    agg_level='District'
    # Prepare the search
    market_dataframe = market_dataframe.drop_duplicates(subset = ['time']).copy()

    # Ordinal Variance to select data quality
    ord_enc = OrdinalEncoder()

    final_dataframe = pd.DataFrame()
    for zone in np.unique(market_dataframe[agg_level]):    

        this_zone = market_dataframe[market_dataframe[agg_level] == zone].fillna(0)
        this_zone = this_zone[this_zone.time >= '2010']
        zone_markets = np.unique(this_zone['District'])

        # For each district save the best feature column
        best_market_data = this_zone[this_zone['District'] == zone_markets[0]][['time', agg_level]].reset_index(drop=True)

        # print('Markets in ' + agg_level + ' = ', zone_markets)
        # print('-----------------------------------------------')

        # Iterate through the features:

        for feature in this_zone.columns[4:]:
            
            ord_variance = np.array([])

            # Iterate through markets
            for market in zone_markets:

                # Select market and ordinal encode values and then calculate variance
                check_market = this_zone[this_zone['District'] == market]
                market_enc = ord_enc.fit_transform(np.array(check_market[feature]).reshape(-1, 1)).astype(int)
                variance = np.var(market_enc.flatten())

                # print(feature)
                # print(market)
                # print(this_zone[this_zone['Market'] == market]['Market Type'].iloc[0])
                # print('Ordinal Variance =', variance)

                ord_variance = np.append(ord_variance, variance)

            # Select the feature that has the maximum variance among markets
            max_index = np.argmax(ord_variance)
            market_best_feature = zone_markets[max_index]

            # print(market_best_feature)

            # Append the best feature to the district data
            best_market_feature = this_zone[(this_zone['District'] == market_best_feature)][feature].reset_index(drop=True)
            best_market_data = pd.concat([best_market_data, best_market_feature], axis=1)

            print('selected:', feature, 'in', market_best_feature)
            print('-------------------------------------------------')

        # Concatenate district data to the final dataframe
        final_dataframe = pd.concat([final_dataframe, best_market_data], axis=0).reset_index(drop=True)

    final_dataframe = final_dataframe.replace(0, np.nan)
    
    return final_dataframe


def market_sub(district, market_data, full_data):
          
            
        if district == 'Baidoa':
            market_data['Vegetable Oil Price'][market_data['Vegetable Oil Price'] > 100000.0] = None
            
        if district == 'Baardheere':

            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Diinsoor'] 
            replace_from.index = replace_from.Date
            market_data['Water Drum Price'] = replace_from['Water Drum Price']        
        
        if district == 'Qoryooley':
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Wanla Weyn'] 
            replace_from.index = replace_from.Date
            
            market_data['Cattle Price'] = replace_from['Cattle Price']
            market_data['Camel Price'] = replace_from['Camel Price']
            
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Marka'] 
            replace_from.index = replace_from.Date
            
            market_data['SomaliShillingToUSD'] = replace_from['SomaliShillingToUSD']
            market_data['Cowpeas Price'] = replace_from['Cowpeas Price']
            market_data['Water Drum Price'] = replace_from['Water Drum Price']    
            
        
        if district == 'Buur Hakaba':
            
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Marka'] 
            replace_from.index = replace_from.Date
            
            market_data['SomaliShillingToUSD'] = replace_from['SomaliShillingToUSD']
            market_data['Cowpeas Price'] = replace_from['Cowpeas Price']
            market_data['Water Drum Price'] = replace_from['Water Drum Price']
            market_data['Vegetable Oil Price'] = replace_from['Vegetable Oil Price']
            
            
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Baidoa'] 
            replace_from.index = replace_from.Date
            
            market_data['Cattle Price'] = replace_from['Cattle Price']
            market_data['Camel Price'] = replace_from['Camel Price']
            
            
        if district == 'Afgooye':
            
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Balcad'] 
            replace_from.index = replace_from.Date
            
            market_data['Red Sorghum Price'] = replace_from['Red Sorghum Price']
            market['Vegetable Oil Price'] = replace_from['Vegetable Oil Price']
            market_data['Goat Price'] = replace_from['Goat Price']
            market_data['Sugar Price'] = replace_from['Sugar Price']
            market_data['Camel Milk Price'] = replace_from['Camel Milk Price']
            market_data['Tea Leaves Price'] = replace_from['Tea Leaves Price']
            market_data['Vegetable Oil Price'][market_data['Vegetable Oil Price'] > 100000.0] = None       
            
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Marka'] 
            replace_from.index = replace_from.Date
            market_data['SomaliShillingToUSD'] = replace_from['SomaliShillingToUSD']
            market_data['Water Drum Price'] = replace_from['Water Drum Price']
            market_data['Cowpeas Price'] = replace_from['Cowpeas Price']
            
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Wanla Weyn'] 
            replace_from.index = replace_from.Date
            
            market_data['Cattle Price'] = replace_from['Cattle Price']
            market_data['Camel Price'] = replace_from['Camel Price']      
            
        
        if district == 'Garbahaarey':
            replace_from = Somalia_IDP_Database[Somalia_IDP_Database['District'] == 'Qansax Dheere'] 
            replace_from.index = replace_from.Date
            
            market_data['Cattle Price'] = replace_from['Cattle Price']
            market_data['Camel Price'] = replace_from['Camel Price']
            market_data['Cowpeas Price'] = replace_from['Cowpeas Price']
            market_data['Water Drum Price'] = replace_from['Water Drum Price']
        

        return market_data



def _mode(*args, **kwargs):
    vals = scipy.stats.mode(*args, **kwargs)
    # only return the mode (discard the count)
    return vals[0].squeeze()

def mode(obj, dim):
    assert isinstance(obj, xr.DataArray)
    axis = obj.ndim - 1
    return xr.apply_ufunc(_mode, obj,
                          input_core_dims=[[dim]],
                          kwargs={'axis': axis},)