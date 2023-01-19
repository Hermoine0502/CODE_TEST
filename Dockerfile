FROM python:3.7.13-buster

ENV PYTHONUNBUFFERED 1
ENV TZ=Asia/Taipei

#
RUN apt-get update && apt-get install -y gcc unixodbc-dev

RUN apt-get install -y libsasl2-modules-gssapi-mit
RUN apt-get install wget && wget https://databricks-bi-artifacts.s3.us-east-2.amazonaws.com/simbaspark-drivers/odbc/2.6.18/SimbaSparkODBC-2.6.18.1030-Debian-64bit.zip && unzip SimbaSparkODBC-2.6.18.1030-Debian-64bit.zip && dpkg -i simbaspark_2.6.18.1030-2_amd64.deb 

# DEPENDECES FOR DOWNLOAD ODBC DRIVER
RUN apt-get install apt-transport-https 
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update

# INSTALL ODBC DRIVER
RUN ACCEPT_EULA=Y apt-get install msodbcsql17 --assume-yes

# CONFIGURE ENV FOR /bin/bash TO USE MSODBCSQL17
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile 
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc 


RUN mkdir /app
COPY . /app
WORKDIR /app

#
RUN pip install --upgrade -r requirements.txt

EXPOSE 80

# Run image 時 echo

CMD ["uvicorn", "Application.main:app", "--host", "0.0.0.0", "--port", "80" , "--timeout-keep-alive", "0", "--root-path=/digital-cabin-job-scheduler-api"]