import requests
import json
import pickle
import pandas as pd
from io import StringIO
from azure.storage.blob import BlobServiceClient


class AzureBlob:
    def __init__(self, resource_group, account_name, container_name):
        self.resource_group = resource_group
        self.account_name = account_name
        self.container_name = container_name

        headers = {'Content-type': 'application/json'}
        api_endpoint = "https://openai-apim.azure-api.net/openai-app-mgmt/api/storage_sas_token_get"
        data = {
            "resource_group": self.resource_group,
            "account_name": self.account_name,
            "container_name": self.container_name
        }
        response = requests.post(url=api_endpoint, data=json.dumps(data), headers=headers).json()

        self.connection_string = response['connection_string']
        self.service_client = BlobServiceClient.from_connection_string(self.connection_string)
        self.client = self.service_client.get_container_client(self.container_name)
    
    def upload_file(self, data, blob):
        self.client.upload_blob(name=blob, data=data, overwrite=True, max_concurrency=2)

    def read_csv(self, blob):
        download_blob = self.client.download_blob(blob=blob, max_concurrency=2)
        return pd.read_csv(StringIO(download_blob.content_as_text()))

    def read_pkl(self, blob):
        download_blob = self.client.download_blob(blob=blob)
        return pickle.loads(download_blob.content_as_bytes())

    def list_blobs(self, blob_path=None):
        return [blob.name for blob in self.client.list_blobs(name_starts_with=blob_path)]

    def delete_blobs(self, blob_path):
        for blob_name in self.list_blobs(blob_path=blob_path):
            blob = self.client.get_blob_client(blob_name)
            blob.delete_blob()
    




