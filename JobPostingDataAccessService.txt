public class JobPostingService : BaseService, IJobPostingService
    {
        public int Insert(JobPostingAddRequest model)
        {
            int id = 0;

            DataProvider.ExecuteNonQuery(GetConnection, "dbo.JobPosting_Insert",
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    MapCommonParameters(model, paramCollection);
                    paramCollection.AddWithValue("@UserIdCreated", UserService.GetCurrentUserId());

                    SqlParameter p = new SqlParameter("@Id", SqlDbType.Int);
                    p.Direction = ParameterDirection.Output;

                    paramCollection.Add(p);
                }, returnParameters: delegate (SqlParameterCollection param)
                {
                    Int32.TryParse(param["@Id"].Value.ToString(), out id);
                }
                );

            return id;
        }
        public void Update(JobPostingUpdateRequest model)
        {

            DataProvider.ExecuteNonQuery(GetConnection, "dbo.JobPosting_Update",
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Id", model.Id);
                    MapCommonParameters(model, paramCollection);
                }
                );
            return;
        }
        public void Delete(int id)
        {

            DataProvider.ExecuteNonQuery(GetConnection, "dbo.JobPosting_Delete",
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@Id", id);
                }
                );

            return;
        }
        public JobPosting SelectById(int id)
        {
            JobPosting jobPosting = new JobPosting();
            List<JobTag> jtList = null;
            List<JobApplicationEmployer> jpaList = null;

            DataProvider.ExecuteCmd(GetConnection, "dbo.JobPosting_SelectById",
               inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@Id", id);
               }
               , map: (Action<IDataReader, short>)delegate (IDataReader reader, short set)
               {
                   switch (set)
                   {
                       case 0:
                           jobPosting = MapJobPosting(reader);
                           break;
                       case 1:
                           int jobPostingId = 0;
                           JobTag jobTag = MapJobTagList(reader, out jobPostingId);
                           if (jtList == null)
                           {
                               jtList = new List<JobTag>();
                           }
                           jtList.Add(jobTag);
                           break;
                       case 2:
                           JobApplicationEmployer jpa = new JobApplicationEmployer();

                           int ord = 0;

                           jpa.Id = reader.GetSafeInt32(ord++);
                           jpa.PersonId = reader.GetSafeInt32(ord++);
                           jpa.FirstName = reader.GetSafeString(ord++);
                           jpa.LastName = reader.GetSafeString(ord++);
                           jpa.JobTitle = reader.GetSafeString(ord++);
                           jpa.Resume = reader.GetSafeString(ord++);
                           jpa.CoverLetter = reader.GetSafeString(ord++);
                           jpa.ApplicationStatus = reader.GetSafeString(ord++);
                           jpa.Notes = reader.GetSafeString(ord++);
                           jpa.DateCreated = reader.GetSafeDateTime(ord++);

                           if (jpaList == null)
                           {
                               jpaList = new List<JobApplicationEmployer>();
                           }
                           jpaList.Add(jpa);
                           break;
                   }
               }
               );
            jobPosting.JobTags = jtList;
            jobPosting.Applications = jpaList;
            return jobPosting;
        }
        public List<JobPosting> SelectAll()
        {
            List<JobPosting> list = null;

            DataProvider.ExecuteCmd(GetConnection, "dbo.JobPosting_SelectAll",
               inputParamMapper: null,
               map: delegate (IDataReader reader, short set)
               {
                   switch (set)
                   {
                       case 0:
                           JobPosting jobPosting = MapJobPosting(reader);
                           if (list == null)
                           {
                               list = new List<JobPosting>();
                           }
                           list.Add(jobPosting);
                           break;
                       case 1:
                           int jobPostingId = 0;
                           JobTag jobTag = MapJobTagList(reader, out jobPostingId);
                           JobPosting jp = list.Find(item => item.Id == jobPostingId);
                           if (jp.JobTags == null)
                           {
                               jp.JobTags = new List<JobTag>();
                           }
                           jp.JobTags.Add(jobTag);
                           break;
                   }
               }
               );

            return list;
        }
        public List<JobPosting> SearchByKeyword(JobPostingSearchRequest searchRequest)
        {
            List<JobPosting> list = null;

            DataProvider.ExecuteCmd(GetConnection, "dbo.JobPosting_SearchByKeyword",
               inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@SearchString", searchRequest.SearchString ?? String.Empty);
                   paramCollection.AddWithValue("@CurrentPage", searchRequest.CurrentPage);
                   paramCollection.AddWithValue("@ItemsPerPage", searchRequest.ItemsPerPage);
                   paramCollection.AddWithValue("@Distance", searchRequest.Distance);
                   paramCollection.AddWithValue("@Compensation", searchRequest.Compensation);
                   paramCollection.AddWithValue("@FullPartId", searchRequest.FullPartId);
                   paramCollection.AddWithValue("@ContractPermanentId", searchRequest.ContractPermanentId);
                   paramCollection.AddWithValue("@ExperienceLevelId", searchRequest.ExperienceLevelId);
                   paramCollection.AddWithValue("@Latitude", searchRequest.Latitude);
                   paramCollection.AddWithValue("@Longitude", searchRequest.Longitude);
                   paramCollection.AddWithValue("@IsDeploy", searchRequest.IsDeploy);

                   DataTable JobTagIdArray = new DataTable();
                   JobTagIdArray.Columns.Add("JobTagId", typeof(Int32));
                   if (searchRequest.JobTagIds != null)
                   {
                       for (int i = 0; i < searchRequest.JobTagIds.Count; i++)
                       {
                           JobTagIdArray.Rows.Add(searchRequest.JobTagIds[i]);
                       }
                   }
                   SqlParameter JobTagIdTable = new SqlParameter();
                   JobTagIdTable.ParameterName = "@JobTagIds";
                   JobTagIdTable.SqlDbType = System.Data.SqlDbType.Structured;
                   JobTagIdTable.Value = JobTagIdArray;
                   paramCollection.Add(JobTagIdTable);
               },
               map: delegate (IDataReader reader, short set)
               {
                   switch (set)
                   {
                       case 0:
                           JobPosting jobPosting = MapJobPosting(reader);
                           if (list == null)
                           {
                               list = new List<JobPosting>();
                           }
                           list.Add(jobPosting);
                           break;
                       case 1:
                           int jobPostingId = 0;
                           JobTag jobTag = MapJobTagList(reader, out jobPostingId);
                           JobPosting jp = list.Find(item => item.Id == jobPostingId);
                           if (jp.JobTags == null)
                           {
                               jp.JobTags = new List<JobTag>();
                           }
                           jp.JobTags.Add(jobTag);
                           break;
                   }
               }
               );
            return list;
        }

        public void ClickLog(JobSearchEngine jobSearchEngine)
        {
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.JobPostingClickLog_AddClick",
                inputParamMapper: delegate (SqlParameterCollection paramCollection)
                {
                    paramCollection.AddWithValue("@JobSearchEngineId", (int)jobSearchEngine);

                }, returnParameters: null
                );
        }

        private static void MapCommonParameters(JobPostingAddRequest model, SqlParameterCollection paramCollection)
        {
            paramCollection.AddWithValue("@CompanyId", model.CompanyId);
            paramCollection.AddWithValue("@PositionName", model.PositionName);
            paramCollection.AddWithValue("@StreetAddress", model.StreetAddress ?? String.Empty);
            paramCollection.AddWithValue("@City", model.City ?? String.Empty);
            paramCollection.AddWithValue("@StateProvinceId", model.StateProvinceId);
            paramCollection.AddWithValue("@CountryId", model.CountryId);
            paramCollection.AddWithValue("@Compensation", model.Compensation);
            paramCollection.AddWithValue("@CompensationRateId", model.CompensationRateId);
            paramCollection.AddWithValue("@FullPartId", model.FullPartId);
            paramCollection.AddWithValue("@ContractPermanentId", model.ContractPermanentId);
            paramCollection.AddWithValue("@ExperienceLevelId", model.ExperienceLevelId);
            paramCollection.AddWithValue("@Description", model.Description ?? String.Empty);
            paramCollection.AddWithValue("@Responsibilities", model.Responsibilities ?? String.Empty);
            paramCollection.AddWithValue("@Requirements", model.Requirements ?? String.Empty);
            paramCollection.AddWithValue("@ContactInformation", model.ContactInformation ?? String.Empty);
            paramCollection.AddWithValue("@Latitude", model.Latitude);
            paramCollection.AddWithValue("@Longitude", model.Longitude);
            paramCollection.AddWithValue("@JobPostingStatusId", model.JobPostingStatusId);


            DataTable JobTagIdArray = new DataTable();
            JobTagIdArray.Columns.Add("JobTagId", typeof(Int32));
            if (model.JobTagIds != null)
            {
                for (int i = 0; i < model.JobTagIds.Count; i++)
                {
                    JobTagIdArray.Rows.Add(model.JobTagIds[i]);
                }
            }
            SqlParameter JobTagIdTable = new SqlParameter();
            JobTagIdTable.ParameterName = "@JobPostingJobTagIds";
            JobTagIdTable.SqlDbType = System.Data.SqlDbType.Structured;
            JobTagIdTable.Value = JobTagIdArray;
            paramCollection.Add(JobTagIdTable);

        }
        private static JobPosting MapJobPosting(IDataReader reader)
        {
            int ord = 0;
            JobPosting jp = new JobPosting();
            jp.Id = reader.GetSafeInt32(ord++);
            jp.CompanyId = reader.GetSafeInt32(ord++);
            jp.CompanyName = reader.GetSafeString(ord++);
            jp.PositionName = reader.GetSafeString(ord++);
            jp.StreetAddress = reader.GetSafeString(ord++);
            jp.City = reader.GetSafeString(ord++);
            jp.StateProvinceId = reader.GetSafeInt32(ord++);
            jp.CountryId = reader.GetSafeInt32(ord++);
            jp.Compensation = reader.GetSafeInt32(ord++);
            jp.CompensationRateId = reader.GetSafeInt32(ord++);
            jp.FullPartId = reader.GetSafeInt32(ord++);
            jp.ContractPermanentId = reader.GetSafeInt32(ord++);
            jp.ExperienceLevelId = reader.GetSafeInt32(ord++);
            jp.Description = reader.GetSafeString(ord++);
            jp.Responsibilities = reader.GetSafeString(ord++);
            jp.Requirements = reader.GetSafeString(ord++);
            jp.ContactInformation = reader.GetSafeString(ord++);
            jp.JobPostingStatusId = reader.GetSafeInt32(ord++);
            jp.DateCreated = reader.GetDateTime(ord++);
            jp.DateModified = reader.GetDateTime(ord++);
            jp.CountryName = reader.GetSafeString(ord++);
            jp.StateProvinceName = reader.GetSafeString(ord++);
            jp.Latitude = reader.GetSafeDouble(ord++);
            jp.Longitude = reader.GetSafeDouble(ord++);
            jp.TotalRows = reader.GetSafeInt32(ord++);
            return jp;
        }
        private static JobTag MapJobTagList(IDataReader reader, out int jobPostingId)
        {
            JobTag jt = new JobTag();
            int ord = 0;
            jobPostingId = reader.GetSafeInt32(ord++);
            jt.Id = reader.GetSafeInt32(ord++);
            jt.Keyword = reader.GetSafeString(ord++);
            jt.DisplayOrder = reader.GetSafeInt32(ord++);
            return jt;
        }
    }