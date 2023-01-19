"""
@ Created on 2022-07-04

@ author: Charlie.Wei

@ purpose: RMRS system for data format check in general format
    
@ structure: 
    # libraries
    # user-defined class
        # DataFormatCheck
           ## row_size
           ## col_space
           ## col_special
           ## col_type
           ## y_col
"""

#region = libraries
import pandas as pd
#endregion


#region = user-defined-class
class DataFormatCheck():
    """
    RMRS system for data format check in general format
    """
    def __init__(self, data, list_Y_col=None):
        """
        參數檢查，如果有list_Y_col會移除Y空值的列
		
		Parameters
        -----
        data : dataframe(pandas)
            欲檢查的資料
        list_Y_col : list, default: None
            資料中的Y欄位名
        """
        if isinstance(data, pd.DataFrame):
            self._df_data = data
        else:
            raise TypeError("data must be a pd.DataFrame.")
        if list_Y_col:
            if isinstance(list_Y_col, list):
                self._list_Y_col = list_Y_col
                self._df_data = self._df_data.dropna(axis=0, subset=list_Y_col)
            else:
                raise TypeError("list_control must be a list.")
        self._size_row, self._size_column = self._df_data.shape
    
    @property
    def shape(self):
        return self._size_row, self._size_column

    def drop_duplicates_and_row_size(self):
        """
        移除重複列並檢查資料筆數

        Return
        -----
        self._df_data : dataframe(pandas)
            移除重複列後的資料
        """
        self._df_data = self._df_data.drop_duplicates(ignore_index=True)
        new_size_row, new_size_column = self._df_data.shape

        if new_size_row < self._size_row:
            self._size_row = new_size_row
            if self._size_row < 30:
                raise ValueError("系統偵測存在重複資料，請使用超過30筆的資料進行分析")
        return self._df_data
    
    def row_size(self):
        """
        檢查資料筆數
        """
        if self._size_row < 30:
            raise ValueError("請使用超過30筆的資料進行分析")
    
    def col_space(self):
        """
        檢查欄位名是否包含空格
        """
        mask_column_contains_space = self._df_data.columns.str.contains(" ")
        column_contains_space = mask_column_contains_space.any()
        if column_contains_space:
            list_column_name_contains_space = self._df_data.columns[mask_column_contains_space]
            raise ValueError(
                "以下欄位可能包含空格：" + " ".join(list_column_name_contains_space)
            )
    
    def col_special(self):
        """
        檢查欄位名是否包含特殊字元，僅允許a-z、A-Z、0-9、_與-
        """
        mask_column_contains_special = self._df_data.columns.str.contains(r"[^a-zA-Z0-9_-]")
        column_contains_special = mask_column_contains_special.any()
        if column_contains_special:
            list_column_name_contains_special = self._df_data.columns[mask_column_contains_special]
            raise ValueError(
                "以下欄位可能包含特殊字元：" + " ".join(list_column_name_contains_special)
            )

    def col_type(self, missing_rate):
        """
        檢查不可用欄位名、不可用原因與可用欄位數

        Return
        -----
        context : dict
            Unavailable column name and reason.
        """
        context = {}

        # 物件欄位
        object_col = self._df_data.select_dtypes(include=['object']).columns.tolist()
        context['object_col'] = object_col

        # 全空白欄位
        NAN_col = self._df_data.columns[self._df_data.isnull().all()].tolist()
        context['NAN_col'] = NAN_col

        # 缺失>missing_rate欄位
        missing75_col = self._df_data.columns[self._df_data.isnull().mean()>=missing_rate].tolist()
        context['missing75_col'] = missing75_col

        # 單一值欄位
        unique_col = self._df_data[[col for col in list(self._df_data) if len(self._df_data[col].dropna().unique())<=1]].columns.tolist()
        context['unique_col'] = unique_col

        # 重複欄位
        duplicated_col = self._df_data.columns[self._df_data.T.duplicated()].tolist()
        context['duplicated_col'] = duplicated_col

        # 所有欄位名
        all_col = {}
        count_can_use_col = 0
        for index, col_name in enumerate(self._df_data.columns):
            if col_name in NAN_col:
                use_status = 1
            elif col_name in object_col:
                use_status = 2
            elif col_name in missing75_col:
                use_status = 3
            elif col_name in unique_col:
                use_status = 4
            elif col_name in duplicated_col:
                use_status = 5
            else:
                use_status = 0
                count_can_use_col += 1
            all_col[index] = [col_name, use_status]
        context['all_col'] = all_col

        # 檢查可用欄位數
        if count_can_use_col < 3:
            raise ValueError("可分析之數值欄位過少，請再次確認資料")
        return context

    def y_col(self):
        """
        檢查Y欄位合併後是否存在單一值欄位
        """
        df_Y = self._df_data[self._list_Y_col]
        has_unique = [col for col in list(df_Y) if len(df_Y[col].unique())<=1]
        if has_unique:
            raise ValueError("此組合存在單一值欄位")